#!/usr/bin/env python3
"""
add_page.py — local helper for adding new topics/categories to CASEFILE
without needing a web-based admin panel. Run this on your own machine,
then commit + push the files it changes/creates.

No dependencies beyond the Python standard library.

USAGE
-----
Add a new top-level page inside an existing category:
    python3 tools/add_page.py --category "Pentesting Web" --title "GraphQL Batching Attacks"

Add a sub-page nested under an existing page (use its slug, shown in
the site's sidebar / URL when you open it, e.g. #/p/<slug>):
    python3 tools/add_page.py --parent-slug sql-injection --title "Blind SQLi Automation"

Create a brand new top-level category:
    python3 tools/add_page.py --new-category "Wireless Pentesting"

List existing categories and their slugs (useful for --category):
    python3 tools/add_page.py --list-categories

WHAT IT DOES
------------
1. Reads assets/js/nav-data.js
2. Adds the new node (with a unique slug + next available TAG-XXXX)
3. Writes assets/js/nav-data.js back out
4. Creates an empty content/<category-slug>/<new-slug>.md file for you to write in
5. Prints exactly what changed, so you can review before committing

After running it:
    git add .
    git commit -m "Add topic: <your title>"
    git push
"""
import json
import re
import os
import sys
import argparse

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SITE_ROOT = os.path.dirname(SCRIPT_DIR)  # tools/ lives one level under site root
NAV_DATA_PATH = os.path.join(SITE_ROOT, 'assets', 'js', 'nav-data.js')


def load_nav_data():
    with open(NAV_DATA_PATH, encoding='utf-8') as f:
        raw = f.read()
    m = re.match(r'window\.SITE_DATA\s*=\s*(.*);\s*$', raw, re.DOTALL)
    if not m:
        print("ERROR: could not parse nav-data.js — is it in the expected format?")
        sys.exit(1)
    full = json.loads(m.group(1))
    return full  # {"siteTitle":..., "siteTagline":..., "author":..., "categories":[...]}


def save_nav_data(full):
    js = "window.SITE_DATA = " + json.dumps(full, ensure_ascii=False, indent=1) + ";\n"
    with open(NAV_DATA_PATH, 'w', encoding='utf-8') as f:
        f.write(js)


def slugify(title):
    s = title.lower()
    s = re.sub(r'[^a-z0-9\s-]', '', s)
    s = re.sub(r'\s+', '-', s).strip('-')
    return (s[:60] or 'page')


def collect_all_slugs(data):
    slugs = set()
    def rec(nodes):
        for n in nodes:
            slugs.add(n['slug'])
            rec(n.get('children', []))
    for cat in data:
        slugs.add(cat['slug'])
        rec(cat.get('children', []))
    return slugs


def unique_slug(title, existing):
    base = slugify(title)
    slug = base
    i = 2
    while slug in existing:
        slug = f"{base}-{i}"
        i += 1
    return slug


def next_tag(data):
    max_n = 0
    def rec(nodes):
        nonlocal max_n
        for n in nodes:
            if n.get('tag'):
                num = int(n['tag'].replace('TAG-', ''))
                max_n = max(max_n, num)
            rec(n.get('children', []))
    for cat in data:
        rec(cat.get('children', []))
    return f"TAG-{max_n + 1:04d}"


def find_category(data, name_or_slug):
    for cat in data:
        if cat['title'] == name_or_slug or cat['slug'] == name_or_slug:
            return cat
    return None


def find_node_by_slug(data, slug):
    def rec(nodes):
        for n in nodes:
            if n['slug'] == slug:
                return n
            found = rec(n.get('children', []))
            if found:
                return found
        return None
    for cat in data:
        found = rec(cat.get('children', []))
        if found:
            return found
    return None


def find_category_slug_for_node(data, target_slug):
    def rec(nodes, cat_slug):
        for n in nodes:
            if n['slug'] == target_slug:
                return cat_slug
            found = rec(n.get('children', []), cat_slug)
            if found:
                return found
        return None
    for cat in data:
        found = rec(cat.get('children', []), cat['slug'])
        if found:
            return found
    return None


def create_content_file(cat_slug, slug, title):
    dirpath = os.path.join(SITE_ROOT, 'content', cat_slug)
    os.makedirs(dirpath, exist_ok=True)
    filepath = os.path.join(dirpath, f"{slug}.md")
    if os.path.exists(filepath):
        print(f"NOTE: {filepath} already exists, leaving it untouched.")
        return filepath
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(f"# {title}\n\nStart writing your notes here.\n")
    return filepath


def main():
    ap = argparse.ArgumentParser(description="Add a page or category to CASEFILE without a web admin panel.")
    ap.add_argument('--title', help="Title of the new page")
    ap.add_argument('--category', help="Existing category title or slug to add a top-level page into")
    ap.add_argument('--parent-slug', help="Slug of an existing page to nest the new page under")
    ap.add_argument('--new-category', help="Title of a brand new top-level category to create")
    ap.add_argument('--list-categories', action='store_true', help="List existing categories and exit")
    ap.add_argument('--color', default=None, help="Hex color for a new category tab (optional)")
    args = ap.parse_args()

    full = load_nav_data()
    data = full['categories']

    if args.list_categories:
        for cat in data:
            print(f"{cat['slug']:45s}  {cat['title']}")
        return

    if args.new_category:
        existing = collect_all_slugs(data)
        slug = unique_slug(args.new_category, existing)
        palette = ['#FFB454', '#4FD1C5', '#C77DFF', '#5FD068', '#E85D5D', '#7FA8D9']
        color = args.color or palette[len(data) % len(palette)]
        new_cat = {"title": args.new_category, "slug": slug, "type": "category", "color": color, "children": []}
        data.append(new_cat)
        save_nav_data(full)
        print(f"Created category '{args.new_category}' (slug: {slug})")
        return

    if not args.title:
        ap.print_help()
        sys.exit(1)

    existing = collect_all_slugs(data)
    slug = unique_slug(args.title, existing)
    tag = next_tag(data)
    new_node = {"title": args.title, "slug": slug, "type": "page", "tag": tag,
                "contentPath": "", "hasContent": True, "children": []}

    if args.parent_slug:
        parent = find_node_by_slug(data, args.parent_slug)
        if not parent:
            print(f"ERROR: no existing page found with slug '{args.parent_slug}'. Use --list-categories or check the site's URL bar for the right slug.")
            sys.exit(1)
        cat_slug = find_category_slug_for_node(data, args.parent_slug)
        new_node['contentPath'] = f"content/{cat_slug}/{slug}.md"
        parent.setdefault('children', []).append(new_node)
        save_nav_data(full)
        create_content_file(cat_slug, slug, args.title)
        print(f"Added '{args.title}' as a sub-page of '{parent['title']}' (slug: {slug}, tag: {tag})")
        return

    if not args.category:
        print("ERROR: specify --category \"Existing Category Name\" or --parent-slug <slug>, or use --new-category first.")
        sys.exit(1)

    cat = find_category(data, args.category)
    if not cat:
        print(f"ERROR: no category found matching '{args.category}'. Run --list-categories to see valid options.")
        sys.exit(1)

    new_node['contentPath'] = f"content/{cat['slug']}/{slug}.md"
    cat.setdefault('children', []).append(new_node)
    save_nav_data(full)
    create_content_file(cat['slug'], slug, args.title)
    print(f"Added '{args.title}' to category '{cat['title']}' (slug: {slug}, tag: {tag})")
    print(f"Write your notes in: content/{cat['slug']}/{slug}.md")


if __name__ == '__main__':
    try:
        main()
    except BrokenPipeError:
        sys.exit(0)
