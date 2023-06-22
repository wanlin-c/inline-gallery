# Inline gallery carousel

## Getting started
Include CSS
```
<link href="inline-gallery.css" rel="stylesheet" />
```

Include Javascript
```
<script src="inline-gallery.js" type="text/javascript"></script>
```

## How to use
```
const gallery = document.getElementById('gallery');

inlineGallery(
  gallery,
  [
    {
      image: 'assets/placeholder1.jpg',
      thumbnail: 'assets/placeholder1.jpg',
    },
    {
      image: 'assets/placeholder2.jpg',
      thumbnail: 'assets/placeholder2.jpg',
      caption: 'Caption only',
    },
    {
      image: 'assets/placeholder3.jpg',
      thumbnail: 'assets/placeholder3.jpg',
      caption: 'Caption',
      description: 'And also some description here',
    }
  ],
  {
    showImageCount: true,
    allowDrag: true,
  }
);
```
