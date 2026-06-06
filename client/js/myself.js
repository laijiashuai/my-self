// 证书图片弹窗逻辑
(function () {
    'use strict';

    var lightbox = document.getElementById('lightbox');
    var lightboxImg = document.getElementById('lightbox-img');
    var lightboxClose = document.querySelector('.lightbox-close');
    var certLinks = document.querySelectorAll('.cert-link');

    // 点击证书链接，打开弹窗
    certLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            var imgSrc = this.getAttribute('data-img');
            if (imgSrc) {
                lightboxImg.src = imgSrc;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // 点击关闭按钮，关闭弹窗
    lightboxClose.addEventListener('click', function () {
        closeLightbox();
    });

    // 点击弹窗背景，关闭弹窗
    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // ESC键关闭弹窗
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeLightbox();
        }
    });

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
})();

// ========== 工作成果跳转 ==========
document.querySelectorAll('.work-link').forEach(function (link) {
    link.addEventListener('click', function (e) {
        var url = this.getAttribute('data-url') || this.getAttribute('href');
        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    });
});
