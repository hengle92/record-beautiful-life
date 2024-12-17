// 获取元素
const postForm = document.getElementById('post-form');
const postText = document.getElementById('post-text');
const postImage = document.getElementById('post-image');
const postsContainer = document.getElementById('posts-container');
const clearButton = document.getElementById('clear-storage');

// 获取模态框元素
const modal = document.getElementById('image-modal');
const modalImg = document.getElementById('modal-image');
const captionText = document.getElementById('caption');
const closeBtn = document.getElementsByClassName('close')[0];

// 打开 IndexedDB
let db;
const request = indexedDB.open('BeautifulLifeDB', 1);

request.onerror = function(event) {
    console.error('IndexedDB 打开失败', event);
};

request.onsuccess = function(event) {
    db = event.target.result;
    console.log('IndexedDB 打开成功');
    displayPosts();
};

request.onupgradeneeded = function(event) {
    db = event.target.result;
    const objectStore = db.createObjectStore('posts', { keyPath: 'id', autoIncrement: true });
    objectStore.createIndex('text', 'text', { unique: false });
    objectStore.createIndex('image', 'image', { unique: false });
    objectStore.createIndex('date', 'date', { unique: false });
    console.log('IndexedDB 对象存储创建成功');
};

// 显示记录
function displayPosts() {
    const transaction = db.transaction(['posts'], 'readonly');
    const objectStore = transaction.objectStore('posts');
    const request = objectStore.getAll();

    request.onsuccess = function(event) {
        const posts = event.target.result;
        postsContainer.innerHTML = '';
        posts.reverse().forEach((post) => {
            const postElement = document.createElement('div');
            postElement.className = 'post';

            const textElement = document.createElement('div');
            textElement.className = 'post-text';
            textElement.textContent = post.text;

            const dateElement = document.createElement('div');
            dateElement.className = 'post-date';
            const date = new Date(post.date);
            dateElement.textContent = date.toLocaleString();

            postElement.appendChild(textElement);
            postElement.appendChild(dateElement);

            if (post.image) {
                const imageElement = document.createElement('div');
                imageElement.className = 'post-image';
                const img = document.createElement('img');
                img.src = post.image;
                img.alt = '记录图片';
                img.addEventListener('click', () => {
                    openModal(post.image, post.text);
                });
                imageElement.appendChild(img);
                postElement.appendChild(imageElement);
            }

            postsContainer.appendChild(postElement);
        });
        console.log(`显示记录数: ${posts.length}`);
    };

    request.onerror = function(event) {
        console.error('获取记录失败', event);
    };
}

// 添加新记录
postForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const text = postText.value.trim();
    const file = postImage.files[0];

    if (!text && !file) {
        alert('请输入文字或选择图片');
        return;
    }

    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const imageData = event.target.result;
            addPost(text, imageData);
        }
        reader.readAsDataURL(file);
    } else {
        addPost(text, null);
    }
});

// 添加记录到 IndexedDB
function addPost(text, image) {
    const transaction = db.transaction(['posts'], 'readwrite');
    const objectStore = transaction.objectStore('posts');
    const post = { text, image, date: new Date().toISOString() };

    const request = objectStore.add(post);

    request.onsuccess = function(event) {
        console.log('添加新记录成功', event);
        displayPosts();
    };

    request.onerror = function(event) {
        console.error('添加新记录失败', event);
    };
}

// 清理所有记录
clearButton.addEventListener('click', function() {
    if (confirm('确定要清理所有记录吗？')) {
        const transaction = db.transaction(['posts'], 'readwrite');
        const objectStore = transaction.objectStore('posts');
        const request = objectStore.clear();

        request.onsuccess = function(event) {
            console.log('所有记录已清理');
            displayPosts();
        };

        request.onerror = function(event) {
            console.error('清理记录失败', event);
        };
    }
});

// 模态框功能
function openModal(src, caption) {
    modal.style.display = "block";
    modalImg.src = src;
    captionText.innerHTML = caption;
}

closeBtn.onclick = function() { 
    modal.style.display = "none";
}

// 点击模态框背景关闭
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

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
