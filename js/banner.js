let slideIndex = 1;
const slides = document.querySelector('.carousel-slide');
const totalImages = document.querySelectorAll('.carousel-slide img').length;

document.getElementById('prevBtn').addEventListener('click', function() {
    moveSlide(-1);
});

document.getElementById('nextBtn').addEventListener('click', function() {
    moveSlide(1);
});

function moveSlide(step) {
    slideIndex += step;
    if (slideIndex < 1) {
        slideIndex = totalImages;
    } else if (slideIndex > totalImages) {
        slideIndex = 1;
    }
    slides.style.transform = `translateX(-${(slideIndex - 1) * 100 / totalImages}%)`;
}