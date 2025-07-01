
    const editableName = document.getElementById('editableName');
    const photoUpload = document.getElementById('photoUpload');
    const uploadLabel = document.getElementById('uploadLabel');
    const generateBtn = document.getElementById('generateBtn');
    const resultImage = document.getElementById('resultImage');
    const downloadLink = document.getElementById('downloadLink');
    const imageCropper = document.getElementById('image-cropper');
    const cropContainer = document.getElementById('cropper-container');
    const cropButton = document.getElementById('crop-image-btn');

    let uploadedImage = null;
    let cropper = null;
    let imageCroppedReady = false;

    const frameImage = new Image();
    frameImage.src = 'assets/photo-frame.png';

    function updatePlaceholder() {
        if (editableName.innerText.trim() === '') {
            editableName.classList.remove('filled');
            editableName.innerText = editableName.getAttribute('data-placeholder');
        } else {
            editableName.classList.add('filled');
        }
    }

    editableName.addEventListener('focus', () => {
        if (editableName.innerText === editableName.getAttribute('data-placeholder')) {
            editableName.innerText = '';
            editableName.classList.add('filled');
        }
    });

    editableName.addEventListener('blur', updatePlaceholder);
    window.addEventListener('DOMContentLoaded', updatePlaceholder);

    photoUpload.addEventListener('change', () => {
        const file = photoUpload.files[0];
        const reader = new FileReader();

        if (file) document.getElementById('uploadLabel').textContent = file.name;

        reader.onload = () => {
            imageCropper.src = reader.result;
            cropContainer.style.display = 'block';
            imageCroppedReady = false;

            if (cropper) cropper.destroy();
            cropper = new Cropper(imageCropper, {
                aspectRatio: 127 / 146,
                viewMode: 1,
                autoCropArea: 1,
            });
        };

        if (file) reader.readAsDataURL(file);
    });

    cropButton.addEventListener('click', () => {
        if (cropper) {
            const croppedCanvas = cropper.getCroppedCanvas({
                width: 300,
                height: 300,
            });

            const tempImage = new Image();
            tempImage.onload = () => {
                uploadedImage = tempImage;
                imageCroppedReady = true;
                cropContainer.style.display = 'none';

                Swal.fire({
                    icon: 'success',
                    title: 'Image Cropped!',
                    text: 'Now click "Generate Image" to frame it.',
                    confirmButtonColor: '#2196F3'
                });
            };
            tempImage.src = croppedCanvas.toDataURL();

        }
    });

    generateBtn.addEventListener('click', () => {
        const name = editableName.innerText.trim();
        const placeholder = editableName.getAttribute('data-placeholder');

        if (!imageCroppedReady || !uploadedImage) {
            Swal.fire({
                icon: 'warning',
                title: 'Incomplete Fields',
                text: 'Please upload and crop a photo first.',
                confirmButtonColor: '#2196F3'
            });
            return;
        }

        if (name === '' || name === placeholder) {
            Swal.fire({
                icon: 'warning',
                title: 'Name Missing',
                text: 'Please enter your name.',
                confirmButtonColor: '#2196F3'
            });
            return;
        }

        drawCanvas(name);
    });

    function drawCanvas(name) {
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');

        const width = 400;
        const height = 500;
        canvas.width = width;
        canvas.height = height;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, width, height);

        const imgWidth = 127;
        const imgHeight = 146;
        const imgX = 22;
        const imgY = 102;

        // Wait until frame image and uploaded image are both loaded
        if (!frameImage.complete || !uploadedImage.complete) {
            console.warn("Image(s) not loaded yet.");
            return;
        }

        ctx.drawImage(frameImage, 0, 0, width, height); // Draw frame FIRST

        drawRoundedImage(ctx, uploadedImage, imgX, imgY, imgWidth, imgHeight, 19); // Then image

        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(name, 170, 220); // Then name


        const dataURL = canvas.toDataURL('image/png');
        resultImage.src = dataURL;
        downloadLink.href = dataURL;
        downloadLink.download = 'framed-photo.png';
        downloadLink.style.display = 'inline';
        downloadLink.textContent = 'Download Your Image';
        canvas.style.display = 'none';
    }

    function drawRoundedImage(ctx, img, x, y, width, height, radius) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(img, x, y, width, height);
        ctx.restore();
    }

