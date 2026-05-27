# Hoàng Đức Anh Kiệt Portfolio

Editorial, responsive portfolio website for internship and junior IT opportunities.

## Structure

```text
portfolio-website/
├── index.html
├── README.md
├── .gitignore
├── assets/
│   ├── images/
│   ├── icons/
│   └── documents/
├── css/
│   └── style.css
└── js/
    └── script.js
```

## Run Locally

From the project root:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

The site is static HTML, CSS, and JavaScript, so it is compatible with GitHub Pages.

## GitHub Pages Hosting

1. Push the latest files to the repository.
2. Open the repository on GitHub.
3. Go to `Settings` > `Pages`.
4. Set the source to the main branch and root folder.
5. Save the settings and wait for GitHub Pages to publish the site.

## Notes

- The CV download points to `assets/documents/hoang-duc-anh-kiet-cv.pdf`.
- Real GitHub profile and project source links were not present in the existing files, so TODO comments are left in the code instead of adding placeholder URLs.
- Project live links were checked: Budget Mate loads on `http://54.179.178.52`, and the Marvel Rivals project redirects to HTTPS.
