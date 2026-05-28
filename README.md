# Hoàng Đức Anh Kiệt Portfolio

Responsive portfolio website for internship and junior IT opportunities. The homepage uses a bold Van Holtz-inspired section index, no-reload animated page transitions, and a three-theme color toggle.

## Pages

- `index.html` - homepage and animated section index
- `about.html` - profile summary
- `skills.html` - technical and soft skills
- `projects.html` - project index
- `education.html` - RMIT education details
- `leadership.html` - leadership experience
- `contact.html` - contact links

## Structure

```text
profile/
├── index.html
├── about.html
├── skills.html
├── projects.html
├── education.html
├── leadership.html
├── contact.html
├── assets/
│   ├── documents/
│   ├── icons/
│   └── images/
├── css/
│   └── style.css
└── js/
    └── script.js
```

## Run Locally

From the project root:

```bash
python3 -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173/index.html
```

## Features

- Separate pages for About, Skills, Projects, Education, Leadership, and Contact
- No-reload HTML route swapping with prefetched pages for smoother transitions
- Animated homepage route transition when clicking the large section links
- HomeTransition animation when returning to or reloading the homepage
- Return transition from every detail page back to the homepage
- Detail-page entry animations for the identity block and content
- Theme toggle with dark, light, and purple modes
- CV download from `assets/documents/Hoang_Duc_Anh_Kiet_CV.pdf`
- LinkedIn and email contact links

## Hosting

This is a static HTML, CSS, and JavaScript site, so it can be hosted on GitHub Pages or any static hosting service.

For GitHub Pages:

1. Push the latest files to the repository.
2. Open the repository on GitHub.
3. Go to `Settings` > `Pages`.
4. Set the source to the main branch and root folder.
5. Save the settings and wait for GitHub Pages to publish the site.
