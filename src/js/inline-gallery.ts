interface inlineGalleryItems {
  image: string;
  thumbnail: string;
  caption?: string;
  description?: string;
}

interface inlineGalleryOptions {
  showImageCount?: boolean;
  allowDrag?: boolean;
}

/* ==================================================
   Main function
================================================== */
const inlineGallery = (
  container: HTMLElement | null,
  items: Array<inlineGalleryItems>,
  options: inlineGalleryOptions = {
    showImageCount: false,
    allowDrag: true
  }
) => {
  // Only runs the code if main container exists
  if (container) {
    const totalImages = items.length;
    container.classList.add('inline-gallery');

    // For tracking sizes of elements
    const size = new sizes();
    size.update(container.offsetWidth, totalImages);

    // for tracking which slides is active
    const slide = new activeSlides();
    slide.init(totalImages);

    // For tracking cursor or finger position
    const cursor = new cursorPostion();

    // Create empty image to use as ghost image when dragging
    const emptyImage = createEmptyImage();

    // Create containers the holds all images and thumbnails
    const imageHolder = createHolder(
      'image',
      size.imageWidth,
      size.imageHeight
    );
    const thumbnailHolder = createHolder(
      'thumbnail',
      size.thumbnailWidth,
      size.thumbnailHeight
    );

    // Create back arrow
    const backArrowHolder = creatArrowHolder('back', size.imageHeight);
    const backArrow = createArrow('back');
    backArrowHolder.append(backArrow);
    backArrow.addEventListener('click', () =>
      gotoSlide(
        'back',
        imageList,
        thumbnailList,
        imageHolder,
        thumbnailHolder,
        totalImages,
        size,
        slide,
        currentImageCount,
        null
      )
    );

    // Create next arrow
    const nextArrowHolder = creatArrowHolder('next', size.imageHeight);
    const nextArrow = createArrow('next');
    nextArrowHolder.append(nextArrow);
    nextArrow.addEventListener('click', () =>
      gotoSlide(
        'next',
        imageList,
        thumbnailList,
        imageHolder,
        thumbnailHolder,
        totalImages,
        size,
        slide,
        currentImageCount,
        null
      )
    );

    // Optional configurations
    if (options) {
      // Create image counter
      if (options.showImageCount) {
        const imageCountHolder = createImageCountHolder(
          totalImages,
          size.imageHeight,
          container
        );
        container.append(imageCountHolder);
      }
    }

    // Create images and thumbnails in the gallery
    for (let i = 0; i < totalImages; i++) {
      // Create image
      const image = createImage(
        'image',
        i,
        size.imageWidth,
        size.imageHeight,
        slide.activeSlide,
        options.allowDrag
      );
      const imageImg = createInnerImage(
        items[i].image,
        size.imageWidth,
        size.imageHeight,
        items[i].caption,
        items[i].description
      );
      image.append(imageImg);

      // Create thumbnail
      const thumbnail = createImage(
        'thumbnail',
        i,
        size.thumbnailWidth,
        size.thumbnailHeight,
        slide.activeSlide,
        options.allowDrag
      );
      const thumbnailImg = createInnerImage(
        items[i].thumbnail ? items[i].thumbnail : items[i].image,
        size.thumbnailWidth,
        size.thumbnailHeight,
        items[i].caption,
        items[i].description
      );
      thumbnail.append(thumbnailImg);

      if (totalImages > 1) {
        thumbnail.addEventListener('click', () =>
          gotoSlide(
            'jump',
            imageList,
            thumbnailList,
            imageHolder,
            thumbnailHolder,
            totalImages,
            size,
            slide,
            currentImageCount,
            thumbnail
          )
        );
      }
      // Create container that holds caption and description
      if (items[i].caption || items[i].description) {
        const contentHolder = createContentHolder(
          items[i].caption,
          items[i].description
        );
        image.append(contentHolder);
      }
      // Add image and thumbnail to their containers
      imageHolder.append(image);
      thumbnailHolder.append(thumbnail);
    }

    // Get all newly created elements
    const currentImageCount = container.querySelector('.image-count-current');
    const imageList: NodeListOf<HTMLLIElement> =
      imageHolder.querySelectorAll('.item-image');
    const thumbnailList: NodeListOf<HTMLLIElement> =
      thumbnailHolder.querySelectorAll('.item-thumbnail');
    const imageListImg: NodeListOf<HTMLImageElement> =
      imageHolder.querySelectorAll('.item-image > img');
    const thumbnailListImg: NodeListOf<HTMLImageElement> =
      thumbnailHolder.querySelectorAll('.item-thumbnail > img');

    window.addEventListener('resize', () => {
      // Update sizes
      size.update(container.offsetWidth, totalImages);

      // Update images and thumbnails
      for (let j = 0; j < totalImages; j++) {
        updateImage(imageList[j], size.imageWidth, size.imageHeight);
        updateInnerImage(imageListImg[j], size.imageWidth, size.imageHeight);
        updateImage(
          thumbnailList[j],
          size.thumbnailWidth,
          size.thumbnailHeight
        );
        updateInnerImage(
          thumbnailListImg[j],
          size.thumbnailWidth,
          size.thumbnailHeight
        );
      }
      // Update image and thumbnail holders
      updatedHolder(imageHolder, size.imageHeight);
      updatedHolder(thumbnailHolder, size.thumbnailHeight);

      // Update arrows
      if (totalImages > 1) {
        updateArrowHolder(backArrowHolder, size.imageHeight);
        updateArrowHolder(nextArrowHolder, size.imageHeight);
      }
      // Adjust scroll position for image container;
      adjustScroll(imageHolder, thumbnailHolder, size, slide);
    });

    // Add all elements below
    container.append(imageHolder);
    container.append(thumbnailHolder);

    if (totalImages > 1) {
      container.append(backArrowHolder);
      container.append(nextArrowHolder);

      if (options.allowDrag === true) {
        // Track cursor position when dragging starts
        imageHolder.addEventListener('dragstart', (e) => {
          // Cache the client X coordinates
          cursor.updateClient(e.clientX);

          // Set ghost image to empty
          if (e.dataTransfer) {
            e.dataTransfer.setDragImage(emptyImage, 0, 0);
          }
        });

        // Go to the previous or next image when dragging stops
        imageHolder.addEventListener('dragend', (e) => {
          // Compute the change in X coordinates
          cursor.updateDelta(e.clientX - cursor.clientX);

          swipeDirection(
            cursor.deltaX,
            imageList,
            thumbnailList,
            imageHolder,
            thumbnailHolder,
            totalImages,
            size,
            slide,
            currentImageCount,
            null,
            true
          );
        });
      }

      // Track finger position when swiping starts
      imageHolder.addEventListener('touchstart', (e) => {
        // Cache the client X coordinates
        cursor.updateClient(e.touches[0].clientX);
      });

      // Go to the previous or next image when swiping stops
      imageHolder.addEventListener('touchend', (e) => {
        // Compute the change in X coordinates
        cursor.updateDelta(e.changedTouches[0].clientX - cursor.clientX);

        swipeDirection(
          cursor.deltaX,
          imageList,
          thumbnailList,
          imageHolder,
          thumbnailHolder,
          totalImages,
          size,
          slide,
          currentImageCount,
          null,
          true
        );
      });
    }
  }
};

export default inlineGallery;

/* ==================================================
   Arrows
================================================== */
const creatArrowHolder = (
  type: 'back' | 'next',
  imageHeight: number
): HTMLDivElement => {
  const arrowHolder = document.createElement('div');
  arrowHolder.classList.add(
    `arrow-${type === 'back' ? 'back' : 'next'}-holder`
  );
  arrowHolder.style.maxHeight = `${imageHeight}px`;
  return arrowHolder;
};

const updateArrowHolder = (
  arrowHolder: HTMLDivElement,
  imageHeight: number
): HTMLDivElement => {
  arrowHolder.style.maxHeight = `${imageHeight}px`;
  return arrowHolder;
};

const createArrow = (type: 'back' | 'next'): HTMLButtonElement => {
  const arrow = document.createElement('button');
  const arrowIcon = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'svg'
  );
  const arrowIconPath = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'path'
  );

  arrow.classList.add(`arrow-${type === 'back' ? 'back' : 'next'}`);
  arrow.setAttribute('type', 'button');
  arrow.setAttribute('aria-label', type)

  arrowIcon.setAttribute('width', '16');
  arrowIcon.setAttribute('height', '16');
  arrowIcon.setAttribute('fill', 'currentColor');
  arrowIcon.setAttribute('viewBox', '0 0 16 16');
  arrowIcon.setAttribute('aria-hidden', 'true');

  arrowIconPath.setAttribute('fill-rule', 'evenodd');
  arrowIconPath.setAttribute(
    'd',
    `${
      type === 'back'
        ? 'M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z'
        : 'M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z'
    }`
  );

  arrowIcon.append(arrowIconPath);
  arrow.append(arrowIcon);
  return arrow;
};

/* ==================================================
   Text content
================================================== */
const createContentHolder = (
  captionText: string | undefined,
  descriptionText: string | undefined
): HTMLDivElement => {
  const contentHolder = document.createElement('div');
  contentHolder.classList.add('item-content');

  // Create caption
  if (captionText !== undefined) {
    const caption = createCaption(`${captionText}`);
    contentHolder.append(caption);
  }
  // Create description
  if (descriptionText !== undefined) {
    const description = createDescription(`${descriptionText}`);
    contentHolder.append(description);
  }
  return contentHolder;
};

const createCaption = (text: string): HTMLHeadingElement => {
  const caption = document.createElement('h4');
  caption.classList.add('item-caption');
  caption.append(`${text}`);
  return caption;
};

const createDescription = (text: string): HTMLParagraphElement => {
  const description = document.createElement('p');
  description.classList.add('item-description');
  description.append(`${text}`);
  return description;
};

/* ==================================================
   Empty Image
================================================== */
const createEmptyImage = (): HTMLImageElement => {
  const emptyImageCanvas = document.createElement('canvas');
  const emptyImage = document.createElement('img');
  emptyImage.setAttribute('src', emptyImageCanvas.toDataURL());
  return emptyImage;
};

/* ==================================================
   Image count
================================================== */
const imageCountHolderHeight = 32;

const createImageCountHolder = (
  totalImages: number,
  imageHeight: number,
  container: HTMLElement
): HTMLDivElement => {
  const imageCountHolder = document.createElement('div');
  const totalImageCount = createTotalImageCount(totalImages);
  const currentImageCount = createCurrentImageCount();

  imageCountHolder.classList.add('image-count-holder');
  imageCountHolder.style.maxHeight = `${imageCountHolderHeight}px`;
  imageCountHolder.style.top = `${imageHeight - imageCountHolderHeight}px`;

  imageCountHolder.append(currentImageCount);
  imageCountHolder.append(totalImageCount);

  // Update image counter position when browser resizes
  window.addEventListener('resize', () => {
    imageCountHolder.style.top = `${
      setImageHeight(container.offsetWidth) - imageCountHolderHeight
    }px`;
  });
  return imageCountHolder;
};

const createTotalImageCount = (totalImages: number): HTMLSpanElement => {
  const totalImageCount = document.createElement('span');
  totalImageCount.textContent = `${totalImages}`;
  totalImageCount.classList.add('image-count-total');
  return totalImageCount;
};

const createCurrentImageCount = (): HTMLSpanElement => {
  const currentImageCount = document.createElement('span');
  currentImageCount.textContent = `1`;
  currentImageCount.classList.add('image-count-current');
  return currentImageCount;
};

/* ==================================================
  Images and Thumbnails
================================================== */
const createHolder = (
  type: 'image' | 'thumbnail',
  width: number,
  height: number
): HTMLUListElement => {
  const holder = document.createElement('ul');
  holder.setAttribute('width', `${width}px`);
  holder.setAttribute('height', `${height}px`);
  holder.classList.add(`${type === 'image' ? 'image' : 'thumbnail'}-holder`);

  // Reset scroll position in firefox
  window.addEventListener('beforeunload', () => {
    holder.scrollTo(0, 0);
  });
  return holder;
};

const updatedHolder = (
  holder: HTMLUListElement,
  imageHeight: number
): HTMLUListElement => {
  holder.setAttribute('height', `${imageHeight}px`);
  return holder;
};

const createImage = (
  type: 'image' | 'thumbnail',
  index: number,
  imageWidth: number,
  imageHeight: number,
  activeSlide: number,
  allowDrag?: boolean | undefined
): HTMLLIElement => {
  const image = document.createElement('li');
  image.classList.add(`item-${type === 'image' ? 'image' : 'thumbnail'}`);
  image.setAttribute('data-index', `${index}`);
  if (index === activeSlide) {
    image.setAttribute('data-active', 'true');

    if (type === 'thumbnail') {
      image.setAttribute('aria-current', 'true');
    }
  }
  if (type === 'image' && allowDrag === true) {
    image.setAttribute('draggable', 'true');
  }
  if (type === 'thumbnail') {
    image.setAttribute('role', `button`);
    image.setAttribute('aria-label', `slide ${index !== undefined && index + 1}`);
  }
  const updatedImage = updateImage(image, imageWidth, imageHeight);
  return updatedImage;
};

const updateImage = (
  image: HTMLLIElement,
  imageWidth: number,
  imageHeight: number
): HTMLLIElement => {
  image.setAttribute('width', `${imageWidth}px`);
  image.setAttribute('height', `${imageHeight}px`);
  image.style.maxWidth = `${imageWidth}px`;
  image.style.maxHeight = `${imageHeight}px`;
  image.style.flexBasis = `${imageWidth}px`;
  return image;
};

// Set size of original image <img> inside image
const createInnerImage = (
  src: string,
  containerWidth: number,
  containerHeight: number,
  caption?: string,
  description?: string
): HTMLImageElement => {
  let altText = ``;

  if (description || caption && description) {
    altText = `${altText} - ${description}`;
  } else if (caption) {
    altText = `${altText} - ${caption}`;
  }
  const imageImg = document.createElement('img');
  imageImg.setAttribute('src', src);
  imageImg.setAttribute('alt', `${altText}`);
  imageImg.setAttribute('draggable', 'false');
  const updatedImageImg = updateInnerImage(
    imageImg,
    containerWidth,
    containerHeight
  );
  return updatedImageImg;
};

const updateInnerImage = (
  image: HTMLImageElement,
  containerWidth: number,
  containerHeight: number
): HTMLImageElement => {
  // Get width and height of original image
  const width = image.naturalWidth;
  const height = image.naturalHeight;

  // Check if image has higher aspect ratio than container
  const hasHigherAspectRatio =
    getAspectRatio(width, height) >
    getAspectRatio(containerWidth, containerHeight);

  // Set image size and position
  if (hasHigherAspectRatio) {
    image.setAttribute('height', `${containerHeight}px`);
    image.setAttribute('width', `auto`);
    image.style.marginLeft = `-${
      (width * (containerHeight / height) - containerWidth) / 2
    }px`;
  } else {
    image.setAttribute('height', `auto`);
    image.setAttribute('width', `${containerWidth}px`);
    image.style.marginTop = `-${
      (height * (containerWidth / width) - containerHeight) / 2
    }px`;
  }
  return image;
};

/* ==================================================
  Utils
================================================== */
// Set height of images
const setImageHeight = (width: number): number => {
  return Math.round((width / 16) * 9);
};

// Get aspect ratio of image
const getAspectRatio = (width: number, height: number): number => {
  return width / height;
};

// Set width of thumbnails
const setThumbnailWidth = (containerWidth: number): number => {
  const windowWidth = window.innerWidth;

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
class sizes {
  containerWidth: number;
  imageWidth: number;
  imageHeight: number;
  imageHolderWidth: number;
  thumbnailWidth: number;
  thumbnailHeight: number;
  thumbnailHolderWidth: number;

  constructor() {
    this.containerWidth = 0;
    this.imageWidth = 0;
    this.imageHeight = 0;
    this.imageHolderWidth = 0;
    this.thumbnailWidth = 0;
    this.thumbnailHeight = 0;
    this.thumbnailHolderWidth = 0;
  }
  update(containerNewWidth: number, totalImages: number) {
    let newThumbnailWidth = setThumbnailWidth(containerNewWidth);
    let newImageHolderWidth = 0;
    let newThumbnailHolderWidth = 0;

    for (let i = 0; i < totalImages; i++) {
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
  }
}

class activeSlides {
  prevSlide: number;
  activeSlide: number;
  nextSlide: number;
  imageScrolled: number;
  thumbnailScrolled: number;

  constructor() {
    this.prevSlide = 0;
    this.activeSlide = 0;
    this.nextSlide = 0;
    this.imageScrolled = 0;
    this.thumbnailScrolled = 0;
  }
  init(totalImages: number) {
    this.prevSlide = totalImages - 1;
    this.activeSlide = 0;
    this.nextSlide = 1;
  }
  goBack(currentSlide: number, totalImages: number) {
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
  }
  goNext(currentSlide: number, totalImages: number) {
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
  }
  goTo(chosenSlide: number, totalImages: number) {
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
  }
  updateScroll(size: sizes) {
    this.imageScrolled = this.activeSlide * size.imageWidth;
    this.thumbnailScrolled =
      this.activeSlide * size.thumbnailWidth - size.thumbnailWidth + 2;
  }
}

class cursorPostion {
  clientX: number;
  deltaX: number;

  constructor() {
    this.clientX = 0;
    this.deltaX = 0;
  }
  updateClient(clientX: number) {
    this.clientX = clientX;
  }
  updateDelta(deltaX: number) {
    this.deltaX = deltaX;
  }
}

/* ==================================================
   Handlers
================================================== */
const gotoSlide = (
  direction: 'back' | 'next' | 'jump',
  imageList: NodeListOf<Element>,
  thumbnailList: NodeListOf<Element>,
  imageHolder: HTMLUListElement,
  thumbnailHolder: HTMLUListElement,
  totalImages: number,
  size: sizes,
  slide: activeSlides,
  currentImageCount?: Element | null,
  chosenSlide?: Element | null,
  isSwipe?: boolean
) => {
  // Disable swipe
  if (isSwipe && direction === 'back' && slide.activeSlide === 0) {
    return false;
  }
  if (
    isSwipe &&
    direction === 'next' &&
    slide.activeSlide === totalImages - 1
  ) {
    return false;
  }

  // Deactivate current active image and thumbnail
  imageList[slide.activeSlide].removeAttribute('data-active');
  thumbnailList[slide.activeSlide].removeAttribute('data-active');
  thumbnailList[slide.activeSlide].removeAttribute('aria-current');

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
        let chosenSlideIndex: number | string | null =
          chosenSlide.getAttribute('data-index');
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
  thumbnailList[slide.activeSlide].setAttribute('aria-current', 'true');
  thumbnailHolder.scroll({
    top: 0,
    left: slide.thumbnailScrolled,
    behavior: 'smooth',
  });

  // Set current image count
  if (currentImageCount) {
    currentImageCount.textContent = `${slide.activeSlide + 1}`;
  }
};

// For adjusting scroll position of image container on resize
const adjustScroll = (
  imageHolder: HTMLUListElement,
  thumbnailHolder: HTMLUListElement,
  size: sizes,
  slide: activeSlides
) => {
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

const swipeDirection = (
  deltaX: number,
  imageList: NodeListOf<Element>,
  thumbnailList: NodeListOf<Element>,
  imageHolder: HTMLUListElement,
  thumbnailHolder: HTMLUListElement,
  totalImages: number,
  size: sizes,
  slide: activeSlides,
  currentImageCount?: Element | null,
  chosenSlide?: Element | null,
  isSwipe?: boolean
) => {
  if (deltaX > 0) {
    gotoSlide(
      'back',
      imageList,
      thumbnailList,
      imageHolder,
      thumbnailHolder,
      totalImages,
      size,
      slide,
      currentImageCount,
      chosenSlide,
      isSwipe
    );
  }
  if (deltaX < 0) {
    gotoSlide(
      'next',
      imageList,
      thumbnailList,
      imageHolder,
      thumbnailHolder,
      totalImages,
      size,
      slide,
      currentImageCount,
      chosenSlide,
      isSwipe
    );
  }
};
