"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* ==================================================
   Main function
================================================== */
var inlineGallery = function (container, items, options) {
    if (options === void 0) { options = {
        showImageCount: false,
        allowDrag: true
    }; }
    // Only runs the code if main container exists
    if (container) {
        var totalImages_1 = items.length;
        container.classList.add('inline-gallery');
        // For tracking sizes of elements
        var size_1 = new sizes();
        size_1.update(container.offsetWidth, totalImages_1);
        // for tracking which slides is active
        var slide_1 = new activeSlides();
        slide_1.init(totalImages_1);
        // For tracking cursor or finger position
        var cursor_1 = new cursorPostion();
        // Create empty image to use as ghost image when dragging
        var emptyImage_1 = createEmptyImage();
        // Create containers the holds all images and thumbnails
        var imageHolder_1 = createHolder('image', size_1.imageWidth, size_1.imageHeight);
        var thumbnailHolder_1 = createHolder('thumbnail', size_1.thumbnailWidth, size_1.thumbnailHeight);
        // Create back arrow
        var backArrowHolder_1 = creatArrowHolder('back', size_1.imageHeight);
        var backArrow = createArrow('back');
        backArrowHolder_1.append(backArrow);
        backArrow.addEventListener('click', function () {
            return gotoSlide('back', imageList_1, thumbnailList_1, imageHolder_1, thumbnailHolder_1, totalImages_1, size_1, slide_1, currentImageCount_1, null);
        });
        // Create next arrow
        var nextArrowHolder_1 = creatArrowHolder('next', size_1.imageHeight);
        var nextArrow = createArrow('next');
        nextArrowHolder_1.append(nextArrow);
        nextArrow.addEventListener('click', function () {
            return gotoSlide('next', imageList_1, thumbnailList_1, imageHolder_1, thumbnailHolder_1, totalImages_1, size_1, slide_1, currentImageCount_1, null);
        });
        // Optional configurations
        if (options) {
            // Create image counter
            if (options.showImageCount) {
                var imageCountHolder = createImageCountHolder(totalImages_1, size_1.imageHeight, container);
                container.append(imageCountHolder);
            }
        }
        var _loop_1 = function (i) {
            // Create image
            var image = createImage('image', i, size_1.imageWidth, size_1.imageHeight, slide_1.activeSlide, options.allowDrag);
            var imageImg = createInnerImage(items[i].image, size_1.imageWidth, size_1.imageHeight, items[i].caption, items[i].description);
            image.append(imageImg);
            // Create thumbnail
            var thumbnail = createImage('thumbnail', i, size_1.thumbnailWidth, size_1.thumbnailHeight, slide_1.activeSlide, options.allowDrag);
            var thumbnailImg = createInnerImage(items[i].thumbnail ? items[i].thumbnail : items[i].image, size_1.thumbnailWidth, size_1.thumbnailHeight, items[i].caption, items[i].description);
            thumbnail.append(thumbnailImg);
            if (totalImages_1 > 1) {
                thumbnail.addEventListener('click', function () {
                    return gotoSlide('jump', imageList_1, thumbnailList_1, imageHolder_1, thumbnailHolder_1, totalImages_1, size_1, slide_1, currentImageCount_1, thumbnail);
                });
            }
            // Create container that holds caption and description
            if (items[i].caption || items[i].description) {
                var contentHolder = createContentHolder(items[i].caption, items[i].description);
                image.append(contentHolder);
            }
            // Add image and thumbnail to their containers
            imageHolder_1.append(image);
            thumbnailHolder_1.append(thumbnail);
        };
        // Create images and thumbnails in the gallery
        for (var i = 0; i < totalImages_1; i++) {
            _loop_1(i);
        }
        // Get all newly created elements
        var currentImageCount_1 = container.querySelector('.image-count-current');
        var imageList_1 = imageHolder_1.querySelectorAll('.item-image');
        var thumbnailList_1 = thumbnailHolder_1.querySelectorAll('.item-thumbnail');
        var imageListImg_1 = imageHolder_1.querySelectorAll('.item-image > img');
        var thumbnailListImg_1 = thumbnailHolder_1.querySelectorAll('.item-thumbnail > img');
        window.addEventListener('resize', function () {
            // Update sizes
            size_1.update(container.offsetWidth, totalImages_1);
            // Update images and thumbnails
            for (var j = 0; j < totalImages_1; j++) {
                updateImage(imageList_1[j], size_1.imageWidth, size_1.imageHeight);
                updateInnerImage(imageListImg_1[j], size_1.imageWidth, size_1.imageHeight);
                updateImage(thumbnailList_1[j], size_1.thumbnailWidth, size_1.thumbnailHeight);
                updateInnerImage(thumbnailListImg_1[j], size_1.thumbnailWidth, size_1.thumbnailHeight);
            }
            // Update image and thumbnail holders
            updatedHolder(imageHolder_1, size_1.imageHeight);
            updatedHolder(thumbnailHolder_1, size_1.thumbnailHeight);
            // Update arrows
            if (totalImages_1 > 1) {
                updateArrowHolder(backArrowHolder_1, size_1.imageHeight);
                updateArrowHolder(nextArrowHolder_1, size_1.imageHeight);
            }
            // Adjust scroll position for image container;
            adjustScroll(imageHolder_1, thumbnailHolder_1, size_1, slide_1);
        });
        // Add all elements below
        container.append(imageHolder_1);
        container.append(thumbnailHolder_1);
        if (totalImages_1 > 1) {
            container.append(backArrowHolder_1);
            container.append(nextArrowHolder_1);
            if (options.allowDrag === true) {
                // Track cursor position when dragging starts
                imageHolder_1.addEventListener('dragstart', function (e) {
                    // Cache the client X coordinates
                    cursor_1.updateClient(e.clientX);
                    // Set ghost image to empty
                    if (e.dataTransfer) {
                        e.dataTransfer.setDragImage(emptyImage_1, 0, 0);
                    }
                });
                // Go to the previous or next image when dragging stops
                imageHolder_1.addEventListener('dragend', function (e) {
                    // Compute the change in X coordinates
                    cursor_1.updateDelta(e.clientX - cursor_1.clientX);
                    swipeDirection(cursor_1.deltaX, imageList_1, thumbnailList_1, imageHolder_1, thumbnailHolder_1, totalImages_1, size_1, slide_1, currentImageCount_1, null, true);
                });
            }
            // Track finger position when swiping starts
            imageHolder_1.addEventListener('touchstart', function (e) {
                // Cache the client X coordinates
                cursor_1.updateClient(e.touches[0].clientX);
            });
            // Go to the previous or next image when swiping stops
            imageHolder_1.addEventListener('touchend', function (e) {
                // Compute the change in X coordinates
                cursor_1.updateDelta(e.changedTouches[0].clientX - cursor_1.clientX);
                swipeDirection(cursor_1.deltaX, imageList_1, thumbnailList_1, imageHolder_1, thumbnailHolder_1, totalImages_1, size_1, slide_1, currentImageCount_1, null, true);
            });
        }
    }
};
exports.default = inlineGallery;
/* ==================================================
   Arrows
================================================== */
var creatArrowHolder = function (type, imageHeight) {
    var arrowHolder = document.createElement('div');
    arrowHolder.classList.add("arrow-".concat(type === 'back' ? 'back' : 'next', "-holder"));
    arrowHolder.style.maxHeight = "".concat(imageHeight, "px");
    return arrowHolder;
};
var updateArrowHolder = function (arrowHolder, imageHeight) {
    arrowHolder.style.maxHeight = "".concat(imageHeight, "px");
    return arrowHolder;
};
var createArrow = function (type) {
    var arrow = document.createElement('button');
    var arrowIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    var arrowIconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arrow.classList.add("arrow-".concat(type === 'back' ? 'back' : 'next'));
    arrow.setAttribute('type', 'button');
    arrowIcon.setAttribute('width', '16');
    arrowIcon.setAttribute('height', '16');
    arrowIcon.setAttribute('fill', 'currentColor');
    arrowIcon.setAttribute('viewBox', '0 0 16 16');
    arrowIconPath.setAttribute('fill-rule', 'evenodd');
    arrowIconPath.setAttribute('d', "".concat(type === 'back'
        ? 'M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z'
        : 'M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z'));
    arrowIcon.append(arrowIconPath);
    arrow.append(arrowIcon);
    return arrow;
};
/* ==================================================
   Text content
================================================== */
var createContentHolder = function (captionText, descriptionText) {
    var contentHolder = document.createElement('div');
    contentHolder.classList.add('item-content');
    // Create caption
    if (captionText !== undefined) {
        var caption = createCaption("".concat(captionText));
        contentHolder.append(caption);
    }
    // Create description
    if (descriptionText !== undefined) {
        var description = createDescription("".concat(descriptionText));
        contentHolder.append(description);
    }
    return contentHolder;
};
var createCaption = function (text) {
    var caption = document.createElement('h4');
    caption.classList.add('item-caption');
    caption.append("".concat(text));
    return caption;
};
var createDescription = function (text) {
    var description = document.createElement('p');
    description.classList.add('item-description');
    description.append("".concat(text));
    return description;
};
/* ==================================================
   Empty Image
================================================== */
var createEmptyImage = function () {
    var emptyImageCanvas = document.createElement('canvas');
    var emptyImage = document.createElement('img');
    emptyImage.setAttribute('src', emptyImageCanvas.toDataURL());
    return emptyImage;
};
/* ==================================================
   Image count
================================================== */
var imageCountHolderHeight = 32;
var createImageCountHolder = function (totalImages, imageHeight, container) {
    var imageCountHolder = document.createElement('div');
    var totalImageCount = createTotalImageCount(totalImages);
    var currentImageCount = createCurrentImageCount();
    imageCountHolder.classList.add('image-count-holder');
    imageCountHolder.style.maxHeight = "".concat(imageCountHolderHeight, "px");
    imageCountHolder.style.top = "".concat(imageHeight - imageCountHolderHeight, "px");
    imageCountHolder.append(currentImageCount);
    imageCountHolder.append(totalImageCount);
    // Update image counter position when browser resizes
    window.addEventListener('resize', function () {
        imageCountHolder.style.top = "".concat(setImageHeight(container.offsetWidth) - imageCountHolderHeight, "px");
    });
    return imageCountHolder;
};
var createTotalImageCount = function (totalImages) {
    var totalImageCount = document.createElement('span');
    totalImageCount.textContent = "".concat(totalImages);
    totalImageCount.classList.add('image-count-total');
    return totalImageCount;
};
var createCurrentImageCount = function () {
    var currentImageCount = document.createElement('span');
    currentImageCount.textContent = "1";
    currentImageCount.classList.add('image-count-current');
    return currentImageCount;
};
/* ==================================================
  Images and Thumbnails
================================================== */
var createHolder = function (type, width, height) {
    var holder = document.createElement('ul');
    holder.setAttribute('width', "".concat(width, "px"));
    holder.setAttribute('height', "".concat(height, "px"));
    holder.classList.add("".concat(type === 'image' ? 'image' : 'thumbnail', "-holder"));
    // Reset scroll position in firefox
    window.addEventListener('beforeunload', function () {
        holder.scrollTo(0, 0);
    });
    return holder;
};
var updatedHolder = function (holder, imageHeight) {
    holder.setAttribute('height', "".concat(imageHeight, "px"));
    return holder;
};
var createImage = function (type, index, imageWidth, imageHeight, activeSlide, allowDrag) {
    var image = document.createElement('li');
    image.classList.add("item-".concat(type === 'image' ? 'image' : 'thumbnail'));
    image.setAttribute('data-index', "".concat(index));
    if (index === activeSlide) {
        image.setAttribute('data-active', 'true');
    }
    if (type === 'image' && allowDrag === true) {
        image.setAttribute('draggable', 'true');
    }
    if (type === 'thumbnail') {
        image.setAttribute('role', "button");
    }
    var updatedImage = updateImage(image, imageWidth, imageHeight);
    return updatedImage;
};
var updateImage = function (image, imageWidth, imageHeight) {
    image.setAttribute('width', "".concat(imageWidth, "px"));
    image.setAttribute('height', "".concat(imageHeight, "px"));
    image.style.maxWidth = "".concat(imageWidth, "px");
    image.style.maxHeight = "".concat(imageHeight, "px");
    image.style.flexBasis = "".concat(imageWidth, "px");
    return image;
};
// Set size of original image <img> inside image
var createInnerImage = function (src, containerWidth, containerHeight, caption, description) {
    var altText = ' ';
    if (caption || caption && description) {
        altText = caption;
    }
    if (description) {
        altText = description;
    }
    var imageImg = document.createElement('img');
    imageImg.setAttribute('src', src);
    imageImg.setAttribute('alt', "".concat(altText));
    imageImg.setAttribute('draggable', 'false');
    var updatedImageImg = updateInnerImage(imageImg, containerWidth, containerHeight);
    return updatedImageImg;
};
var updateInnerImage = function (image, containerWidth, containerHeight) {
    // Get width and height of original image
    var width = image.naturalWidth;
    var height = image.naturalHeight;
    // Check if image has higher aspect ratio than container
    var hasHigherAspectRatio = getAspectRatio(width, height) >
        getAspectRatio(containerWidth, containerHeight);
    // Set image size and position
    if (hasHigherAspectRatio) {
        image.setAttribute('height', "".concat(containerHeight, "px"));
        image.setAttribute('width', "auto");
        image.style.marginLeft = "-".concat((width * (containerHeight / height) - containerWidth) / 2, "px");
    }
    else {
        image.setAttribute('height', "auto");
        image.setAttribute('width', "".concat(containerWidth, "px"));
        image.style.marginTop = "-".concat((height * (containerWidth / width) - containerHeight) / 2, "px");
    }
    return image;
};
/* ==================================================
  Utils
================================================== */
// Set height of images
var setImageHeight = function (width) {
    return Math.round((width / 16) * 9);
};
// Get aspect ratio of image
var getAspectRatio = function (width, height) {
    return width / height;
};
// Set width of thumbnails
var setThumbnailWidth = function (containerWidth) {
    var windowWidth = window.innerWidth;
    if (windowWidth >= 768) {
        return Math.round(containerWidth / 5.5 + 8) - 16;
    }
    if (windowWidth >= 576 && windowWidth < 768) {
        return Math.round(containerWidth / 4.5 + 8) - 16;
    }
    return Math.round(containerWidth / 3.5 + 8) - 16;
};
/* ==================================================
  Data
================================================== */
var sizes = /** @class */ (function () {
    function sizes() {
        this.containerWidth = 0;
        this.imageWidth = 0;
        this.imageHeight = 0;
        this.imageHolderWidth = 0;
        this.thumbnailWidth = 0;
        this.thumbnailHeight = 0;
        this.thumbnailHolderWidth = 0;
    }
    sizes.prototype.update = function (containerNewWidth, totalImages) {
        var newThumbnailWidth = setThumbnailWidth(containerNewWidth);
        var newImageHolderWidth = 0;
        var newThumbnailHolderWidth = 0;
        for (var i = 0; i < totalImages; i++) {
            newImageHolderWidth += containerNewWidth;
            newThumbnailHolderWidth += newThumbnailWidth;
        }
        this.containerWidth = containerNewWidth;
        this.imageWidth = containerNewWidth;
        this.imageHeight = setImageHeight(containerNewWidth);
        this.imageHolderWidth = newImageHolderWidth;
        this.thumbnailWidth = newThumbnailWidth;
        this.thumbnailHeight = setImageHeight(newThumbnailWidth);
        this.thumbnailHolderWidth = newThumbnailHolderWidth;
    };
    return sizes;
}());
var activeSlides = /** @class */ (function () {
    function activeSlides() {
        this.prevSlide = 0;
        this.activeSlide = 0;
        this.nextSlide = 0;
        this.imageScrolled = 0;
        this.thumbnailScrolled = 0;
    }
    activeSlides.prototype.init = function (totalImages) {
        this.prevSlide = totalImages - 1;
        this.activeSlide = 0;
        this.nextSlide = 1;
    };
    activeSlides.prototype.goBack = function (currentSlide, totalImages) {
        switch (currentSlide) {
            case 0: {
                this.prevSlide = totalImages - 2;
                this.activeSlide = totalImages - 1;
                this.nextSlide = 0;
                break;
            }
            default: {
                this.prevSlide = currentSlide - 2;
                this.activeSlide = currentSlide - 1;
                this.nextSlide = currentSlide;
            }
        }
    };
    activeSlides.prototype.goNext = function (currentSlide, totalImages) {
        switch (currentSlide) {
            case totalImages - 1: {
                this.prevSlide = totalImages - 1;
                this.activeSlide = 0;
                this.nextSlide = 1;
                break;
            }
            default: {
                this.prevSlide = currentSlide;
                this.activeSlide = currentSlide + 1;
                this.nextSlide = currentSlide + 2;
            }
        }
    };
    activeSlides.prototype.goTo = function (chosenSlide, totalImages) {
        switch (chosenSlide) {
            case 0: {
                this.prevSlide = totalImages - 1;
                this.activeSlide = 0;
                this.nextSlide = 1;
                break;
            }
            case totalImages - 1: {
                this.prevSlide = totalImages - 2;
                this.activeSlide = totalImages - 1;
                this.nextSlide = 0;
                break;
            }
            default: {
                this.prevSlide = chosenSlide - 1;
                this.activeSlide = chosenSlide;
                this.nextSlide = chosenSlide + 1;
            }
        }
    };
    activeSlides.prototype.updateScroll = function (size) {
        this.imageScrolled = this.activeSlide * size.imageWidth;
        this.thumbnailScrolled =
            this.activeSlide * size.thumbnailWidth - size.thumbnailWidth + 2;
    };
    return activeSlides;
}());
var cursorPostion = /** @class */ (function () {
    function cursorPostion() {
        this.clientX = 0;
        this.deltaX = 0;
    }
    cursorPostion.prototype.updateClient = function (clientX) {
        this.clientX = clientX;
    };
    cursorPostion.prototype.updateDelta = function (deltaX) {
        this.deltaX = deltaX;
    };
    return cursorPostion;
}());
/* ==================================================
   Handlers
================================================== */
var gotoSlide = function (direction, imageList, thumbnailList, imageHolder, thumbnailHolder, totalImages, size, slide, currentImageCount, chosenSlide, isSwipe) {
    // Disable swipe
    if (isSwipe && direction === 'back' && slide.activeSlide === 0) {
        return false;
    }
    if (isSwipe &&
        direction === 'next' &&
        slide.activeSlide === totalImages - 1) {
        return false;
    }
    // Deactivate current active image and thumbnail
    imageList[slide.activeSlide].removeAttribute('data-active');
    thumbnailList[slide.activeSlide].removeAttribute('data-active');
    // Update slide index
    switch (direction) {
        case 'back':
            slide.goBack(slide.activeSlide, totalImages);
            break;
        case 'next':
            slide.goNext(slide.activeSlide, totalImages);
            break;
        case 'jump':
            if (chosenSlide) {
                var chosenSlideIndex = chosenSlide.getAttribute('data-index');
                chosenSlideIndex = parseInt(chosenSlideIndex ? chosenSlideIndex : '0');
                slide.goTo(chosenSlideIndex, totalImages);
            }
            break;
        default:
            return false;
    }
    // Update scroll position
    slide.updateScroll(size);
    // Set new active image
    imageList[slide.activeSlide].setAttribute('data-active', 'true');
    imageHolder.scroll({
        top: 0,
        left: slide.imageScrolled,
        behavior: 'smooth',
    });
    // Set new active thumbnail
    thumbnailList[slide.activeSlide].setAttribute('data-active', 'true');
    thumbnailHolder.scroll({
        top: 0,
        left: slide.thumbnailScrolled,
        behavior: 'smooth',
    });
    // Set current image count
    if (currentImageCount) {
        currentImageCount.textContent = "".concat(slide.activeSlide + 1);
    }
};
// For adjusting scroll position of image container on resize
var adjustScroll = function (imageHolder, thumbnailHolder, size, slide) {
    /// Update scroll position
    slide.updateScroll(size);
    // adjust scroll for images
    imageHolder.scroll({
        top: 0,
        left: slide.imageScrolled,
    });
    // adjust scroll for thumbnails
    thumbnailHolder.scroll({
        top: 0,
        left: slide.thumbnailScrolled,
    });
};
var swipeDirection = function (deltaX, imageList, thumbnailList, imageHolder, thumbnailHolder, totalImages, size, slide, currentImageCount, chosenSlide, isSwipe) {
    if (deltaX > 0) {
        gotoSlide('back', imageList, thumbnailList, imageHolder, thumbnailHolder, totalImages, size, slide, currentImageCount, chosenSlide, isSwipe);
    }
    if (deltaX < 0) {
        gotoSlide('next', imageList, thumbnailList, imageHolder, thumbnailHolder, totalImages, size, slide, currentImageCount, chosenSlide, isSwipe);
    }
};
