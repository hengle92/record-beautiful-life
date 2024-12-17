// 获取元素
const postForm = document.getElementById('post-form');
const postText = document.getElementById('post-text');
const postImage = document.getElementById('post-image');
const postsContainer = document.getElementById('posts-container');

// 读取已有记录
let posts = JSON.parse(localStorage.getItem('posts')) || [];

// 显示记录
function displayPosts() {
    postsContainer.innerHTML = '';
    posts.slice().reverse().forEach((post, index) => {
        const postElement = document.createElement('div');
        postElement.className = 'post';

        const textElement = document.createElement('div');
        textElement.className = 'post-text';
        textElement.textContent = post.text;

        postElement.appendChild(textElement);

        if (post.image) {
            const imageElement = document.createElement('div');
            imageElement.className = 'post-image';
            const img = document.createElement('img');
            img.src = post.image;
            img.alt = '记录图片';
            imageElement.appendChild(img);
            postElement.appendChild(imageElement);
        }

        postsContainer.appendChild(postElement);
    });
}

// 添加新记录
postForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const text = postText.value.trim();
    if (!text && !postImage.files[0]) {
        alert('请输入文字或选择图片');
        return;
    }

    if (postImage.files[0]) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const imageData = event.target.result;
            addPost(text, imageData);
        }
        reader.readAsDataURL(postImage.files[0]);
    } else {
        addPost(text, null);
    }
});

// 添加记录到数组并更新存储
function addPost(text, image) {
    const newPost = { text, image };
    posts.push(newPost);
    localStorage.setItem('posts', JSON.stringify(posts));
    postForm.reset();
    displayPosts();
}

// 初始化
document.addEventListener('DOMContentLoaded', displayPosts);

// 注册服务工作者
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('service-worker.js').then(function(registration) {
            console.log('ServiceWorker 注册成功:', registration.scope);
        }, function(err) {
            console.log('ServiceWorker 注册失败:', err);
        });
    });
}
