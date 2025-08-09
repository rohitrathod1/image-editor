document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const image = document.getElementById('chosen-image');
    const imagePlaceholder = document.querySelector('.image-placeholder');
    const uploadInput = document.getElementById('upload-input');
    const uploadButton = document.getElementById('upload-button');
    const downloadButton = document.getElementById('download-button');
    const resetButton = document.getElementById('reset-button');
    const toggleFiltersBtn = document.getElementById('toggle-filters');
    const toggleTransformsBtn = document.getElementById('toggle-transforms');
    const filtersPanel = document.getElementById('filters-panel');
    const transformsPanel = document.getElementById('transforms-panel');
    const cropModal = document.getElementById('crop-modal');
    const closeModal = document.querySelector('.close');
    const cropTarget = document.getElementById('crop-target');
    const applyCropBtn = document.getElementById('apply-crop');

    // Filter controls
    const blurInput = document.getElementById('blur');
    const contrastInput = document.getElementById('contrast');
    const brightnessInput = document.getElementById('brightness');
    const saturationInput = document.getElementById('saturation');
    const grayscaleInput = document.getElementById('grayscale');
    const hueInput = document.getElementById('hue');
    const opacityInput = document.getElementById('opacity');
    const sepiaInput = document.getElementById('sepia');
    const zoomInput = document.getElementById('zoom');
    const borderInput = document.getElementById('border');

    // Range value displays
    const blurValue = document.getElementById('blur-value');
    const contrastValue = document.getElementById('contrast-value');
    const brightnessValue = document.getElementById('brightness-value');
    const saturationValue = document.getElementById('saturation-value');
    const grayscaleValue = document.getElementById('grayscale-value');
    const hueValue = document.getElementById('hue-value');
    const opacityValue = document.getElementById('opacity-value');
    const sepiaValue = document.getElementById('sepia-value');
    const zoomValue = document.getElementById('zoom-value');
    const borderValue = document.getElementById('border-value');

    // Effect buttons
    const vintageEffectBtn = document.getElementById('vintage-effect');
    const coolEffectBtn = document.getElementById('cool-effect');
    const warmEffectBtn = document.getElementById('warm-effect');
    const invertColorsBtn = document.getElementById('invert-colors');
    const blackWhiteBtn = document.getElementById('black-white');
    const sharpenEffectBtn = document.getElementById('sharpen-effect');

    // Transform buttons
    const rotateLeftBtn = document.getElementById('rotate-left');
    const rotateRightBtn = document.getElementById('rotate-right');
    const flipHorizontalBtn = document.getElementById('flip-horizontal');
    const flipVerticalBtn = document.getElementById('flip-vertical');
    const cropImageBtn = document.getElementById('crop-image');
    const borderEffectBtn = document.getElementById('border-effect');

    // State variables
    let rotation = 0;
    let scaleX = 1;
    let scaleY = 1;
    let zoom = 1;
    let isInverted = false;
    let hasBorder = false;
    let borderSize = 0;
    let currentFilters = {
        blur: 0,
        contrast: 100,
        brightness: 100,
        saturation: 100,
        grayscale: 0,
        hue: 0,
        opacity: 100,
        sepia: 0
    };
    let cropper;

    // Initialize
    updateRangeValues();
    checkMobileView();

    // Event Listeners
    uploadButton.addEventListener('click', () => uploadInput.click());
    uploadInput.addEventListener('change', handleImageUpload);
    downloadButton.addEventListener('click', downloadImage);
    resetButton.addEventListener('click', resetAll);
    toggleFiltersBtn.addEventListener('click', () => togglePanel(filtersPanel));
    toggleTransformsBtn.addEventListener('click', () => togglePanel(transformsPanel));
    closeModal.addEventListener('click', closeCropModal);
    applyCropBtn.addEventListener('click', applyCrop);

    // Filter controls
    blurInput.addEventListener('input', updateBlur);
    contrastInput.addEventListener('input', updateContrast);
    brightnessInput.addEventListener('input', updateBrightness);
    saturationInput.addEventListener('input', updateSaturation);
    grayscaleInput.addEventListener('input', updateGrayscale);
    hueInput.addEventListener('input', updateHue);
    opacityInput.addEventListener('input', updateOpacity);
    sepiaInput.addEventListener('input', updateSepia);
    zoomInput.addEventListener('input', updateZoom);
    borderInput.addEventListener('input', updateBorder);

    // Effect buttons
    vintageEffectBtn.addEventListener('click', applyVintageEffect);
    coolEffectBtn.addEventListener('click', applyCoolEffect);
    warmEffectBtn.addEventListener('click', applyWarmEffect);
    invertColorsBtn.addEventListener('click', toggleInvertColors);
    blackWhiteBtn.addEventListener('click', applyBlackWhite);
    sharpenEffectBtn.addEventListener('click', applySharpenEffect);

    // Transform buttons
    rotateLeftBtn.addEventListener('click', rotateLeft);
    rotateRightBtn.addEventListener('click', rotateRight);
    flipHorizontalBtn.addEventListener('click', flipHorizontal);
    flipVerticalBtn.addEventListener('click', flipVertical);
    cropImageBtn.addEventListener('click', initCrop);
    borderEffectBtn.addEventListener('click', function() {
        hasBorder = !hasBorder;
        if (hasBorder) {
            borderSize = 5; // Default border size when enabled
            borderInput.value = borderSize;
            borderValue.textContent = `${borderSize}px`;
        } else {
            borderSize = 0;
            borderInput.value = borderSize;
            borderValue.textContent = `${borderSize}px`;
        }
        applyFilters();
    });

    // Window resize handler
    window.addEventListener('resize', checkMobileView);

    // Functions
    function handleImageUpload() {
        const file = uploadInput.files[0];
        if (file && file.type.match('image.*')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                image.src = e.target.result;
                image.onload = function() {
                    imagePlaceholder.style.display = 'none';
                    downloadButton.disabled = false;
                    resetAll();
                };
                image.onerror = function() {
                    alert('Error loading image. Please try another file.');
                    resetAll();
                };
            };
            reader.readAsDataURL(file);
        } else {
            alert('Please select a valid image file.');
        }
    }

    function applyFilters() {
        const filters = `
            blur(${currentFilters.blur}px)
            contrast(${currentFilters.contrast}%)
            brightness(${currentFilters.brightness}%)
            saturate(${currentFilters.saturation}%)
            grayscale(${currentFilters.grayscale}%)
            hue-rotate(${currentFilters.hue}deg)
            opacity(${currentFilters.opacity}%)
            sepia(${currentFilters.sepia}%)
            ${isInverted ? 'invert(1)' : ''}
        `;
        image.style.filter = filters;
        image.style.transform = `rotate(${rotation}deg) scale(${scaleX * zoom}, ${scaleY * zoom})`;
        
        if (hasBorder) {
            image.style.border = `${borderSize}px solid #ff69b4`;
            image.style.boxShadow = '0 0 15px rgba(255, 105, 180, 0.7)';
        } else {
            image.style.border = 'none';
            image.style.boxShadow = 'none';
        }
    }

    function updateRangeValues() {
        blurValue.textContent = `${currentFilters.blur}px`;
        contrastValue.textContent = `${currentFilters.contrast}%`;
        brightnessValue.textContent = `${currentFilters.brightness}%`;
        saturationValue.textContent = `${currentFilters.saturation}%`;
        grayscaleValue.textContent = `${currentFilters.grayscale}%`;
        hueValue.textContent = `${currentFilters.hue}deg`;
        opacityValue.textContent = `${currentFilters.opacity}%`;
        sepiaValue.textContent = `${currentFilters.sepia}%`;
        zoomValue.textContent = `${zoom * 100}%`;
        borderValue.textContent = `${borderSize}px`;
    }

    // Filter update functions
    function updateBlur() {
        currentFilters.blur = parseFloat(blurInput.value);
        blurValue.textContent = `${currentFilters.blur}px`;
        applyFilters();
    }

    function updateContrast() {
        currentFilters.contrast = parseInt(contrastInput.value);
        contrastValue.textContent = `${currentFilters.contrast}%`;
        applyFilters();
    }

    function updateBrightness() {
        currentFilters.brightness = parseInt(brightnessInput.value);
        brightnessValue.textContent = `${currentFilters.brightness}%`;
        applyFilters();
    }

    function updateSaturation() {
        currentFilters.saturation = parseInt(saturationInput.value);
        saturationValue.textContent = `${currentFilters.saturation}%`;
        applyFilters();
    }

    function updateGrayscale() {
        currentFilters.grayscale = parseInt(grayscaleInput.value);
        grayscaleValue.textContent = `${currentFilters.grayscale}%`;
        applyFilters();
    }

    function updateHue() {
        currentFilters.hue = parseInt(hueInput.value);
        hueValue.textContent = `${currentFilters.hue}deg`;
        applyFilters();
    }

    function updateOpacity() {
        currentFilters.opacity = parseInt(opacityInput.value);
        opacityValue.textContent = `${currentFilters.opacity}%`;
        applyFilters();
    }

    function updateSepia() {
        currentFilters.sepia = parseInt(sepiaInput.value);
        sepiaValue.textContent = `${currentFilters.sepia}%`;
        applyFilters();
    }

    function updateZoom() {
        zoom = parseInt(zoomInput.value) / 100;
        zoomValue.textContent = `${zoomInput.value}%`;
        applyFilters();
    }

    function updateBorder() {
        borderSize = parseInt(borderInput.value);
        borderValue.textContent = `${borderSize}px`;
        hasBorder = borderSize > 0;
        applyFilters();
    }

    // Effect functions
    function applyVintageEffect() {
        currentFilters = {
            blur: 0.5,
            contrast: 120,
            brightness: 110,
            saturation: 80,
            grayscale: 0,
            hue: 0,
            opacity: 100,
            sepia: 40
        };
        updateAllInputs();
        applyFilters();
    }

    function applyCoolEffect() {
        currentFilters = {
            blur: 0,
            contrast: 110,
            brightness: 100,
            saturation: 120,
            grayscale: 0,
            hue: 200,
            opacity: 100,
            sepia: 0
        };
        updateAllInputs();
        applyFilters();
    }

    function applyWarmEffect() {
        currentFilters = {
            blur: 0,
            contrast: 110,
            brightness: 110,
            saturation: 120,
            grayscale: 0,
            hue: 30,
            opacity: 100,
            sepia: 20
        };
        updateAllInputs();
        applyFilters();
    }

    function toggleInvertColors() {
        isInverted = !isInverted;
        applyFilters();
    }

    function applyBlackWhite() {
        currentFilters = {
            blur: 0,
            contrast: 120,
            brightness: 100,
            saturation: 0,
            grayscale: 100,
            hue: 0,
            opacity: 100,
            sepia: 0
        };
        updateAllInputs();
        applyFilters();
    }

    function applySharpenEffect() {
        currentFilters = {
            blur: 0,
            contrast: 150,
            brightness: 100,
            saturation: 100,
            grayscale: 0,
            hue: 0,
            opacity: 100,
            sepia: 0
        };
        updateAllInputs();
        applyFilters();
    }

    // Transform functions
    function rotateLeft() {
        rotation -= 90;
        applyFilters();
    }

    function rotateRight() {
        rotation += 90;
        applyFilters();
    }

    function flipHorizontal() {
        scaleX *= -1;
        applyFilters();
    }

    function flipVertical() {
        scaleY *= -1;
        applyFilters();
    }

    function initCrop() {
        if (!image.src) {
            alert('Please upload an image first');
            return;
        }

        cropTarget.src = image.src;
        cropModal.style.display = 'block';

        // Initialize Cropper.js
        cropper = new Cropper(cropTarget, {
            aspectRatio: NaN, // Free ratio
            viewMode: 1,
            autoCropArea: 0.8,
            responsive: true,
            guides: true
        });
    }

    function applyCrop() {
        if (!cropper) return;

        // Get cropped canvas
        const canvas = cropper.getCroppedCanvas({
            width: image.naturalWidth,
            height: image.naturalHeight
        });

        if (canvas) {
            // Convert canvas to blob and update the image
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                image.src = url;
                closeCropModal();
            }, 'image/png');
        }
    }

    function closeCropModal() {
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
        cropModal.style.display = 'none';
    }

    // Panel functions
    function togglePanel(panel) {
        if (panel.style.display === 'block') {
            panel.style.display = 'none';
        } else {
            // Hide all panels first
            document.querySelectorAll('.panel').forEach(p => {
                p.style.display = 'none';
            });
            // Show the selected panel
            panel.style.display = 'block';
        }
    }

    function checkMobileView() {
        if (window.innerWidth <= 768) {
            filtersPanel.style.display = 'none';
            transformsPanel.style.display = 'none';
            document.querySelector('.mobile-controls').style.display = 'flex';
        } else {
            filtersPanel.style.display = 'block';
            transformsPanel.style.display = 'block';
            document.querySelector('.mobile-controls').style.display = 'none';
        }
    }

    function downloadImage() {
        if (!image.src) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;

        // Apply filters to canvas
        ctx.filter = `
            blur(${currentFilters.blur}px)
            contrast(${currentFilters.contrast}%)
            brightness(${currentFilters.brightness}%)
            saturate(${currentFilters.saturation}%)
            grayscale(${currentFilters.grayscale}%)
            hue-rotate(${currentFilters.hue}deg)
            sepia(${currentFilters.sepia}%)
            ${isInverted ? 'invert(1)' : ''}
        `;

        // Apply transformations
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(rotation * Math.PI / 180);
        ctx.scale(scaleX * zoom, scaleY * zoom);
        ctx.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2, image.naturalWidth, image.naturalHeight);

        // Apply border if needed
        if (hasBorder) {
            ctx.strokeStyle = '#ff69b4';
            ctx.lineWidth = borderSize;
            ctx.strokeRect(-image.naturalWidth / 2, -image.naturalHeight / 2, image.naturalWidth, image.naturalHeight);
        }

        // Create download link
        const link = document.createElement('a');
        link.download = 'edited-image.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    function resetAll() {
        // Reset filters
        currentFilters = {
            blur: 0,
            contrast: 100,
            brightness: 100,
            saturation: 100,
            grayscale: 0,
            hue: 0,
            opacity: 100,
            sepia: 0
        };

        // Reset transform properties
        rotation = 0;
        scaleX = 1;
        scaleY = 1;
        zoom = 1;
        isInverted = false;
        hasBorder = false;
        borderSize = 0;

        // Update input values
        updateAllInputs();

        // Apply reset
        applyFilters();
    }

    function updateAllInputs() {
        blurInput.value = currentFilters.blur;
        contrastInput.value = currentFilters.contrast;
        brightnessInput.value = currentFilters.brightness;
        saturationInput.value = currentFilters.saturation;
        grayscaleInput.value = currentFilters.grayscale;
        hueInput.value = currentFilters.hue;
        opacityInput.value = currentFilters.opacity;
        sepiaInput.value = currentFilters.sepia;
        zoomInput.value = zoom * 100;
        borderInput.value = borderSize;
        updateRangeValues();
    }
});