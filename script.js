// 预设的四川美食列表
const sichuanFoods = [
    '火锅', '串串香', '冒菜', '担担面', '龙抄手', '钟水饺', 
    '赖汤圆', '夫妻肺片', '麻婆豆腐', '回锅肉', '宫保鸡丁', '水煮鱼',
    '口水鸡', '鱼香肉丝', '干煸豆角', '辣子鸡', '毛血旺', '酸菜鱼',
    '甜皮鸭', '钵钵鸡', '肥肠粉', '宜宾燃面', '乐山豆腐脑', '伤心凉粉'
];

// 其他预设美食列表
const snackFoods = [
    '小面', '酸辣粉', '凉面', '凉皮', '锅盔', '抄手', '馄饨', 
    '煎饼果子', '肉夹馍', '烤冷面', '炸鸡', '汉堡', '披萨', '寿司',
    '螺蛳粉', '桂林米粉', '过桥米线', '热干面', '刀削面', '牛肉面'
];

const restaurantFoods = [
    '川菜馆', '火锅店', '日料店', '西餐厅', '韩料店', '泰国菜',
    '粤菜馆', '湘菜馆', '东北菜', '西北菜', '家常菜', '快餐店',
    '烧烤', '自助餐', '海鲜', '素食', '农家乐', '私房菜'
];

const drinkFoods = [
    '奶茶', '咖啡', '果汁', '可乐', '雪碧', '苏打水', '柠檬水',
    '绿茶', '红茶', '普洱茶', '花茶', '豆浆', '牛奶', '酸奶',
    '椰汁', '酸梅汤', '凉茶', '冰粉', '龟苓膏', '烧仙草'
];

// 应用状态
let currentFoodList = [...sichuanFoods];
let isSpinning = false;
let customLists = [];

// DOM元素
const wheelCanvas = document.getElementById('wheelCanvas');
const ctx = wheelCanvas.getContext('2d');
const spinButton = document.getElementById('spinButton');
const resultContainer = document.getElementById('resultContainer');
const listTabs = document.getElementById('listTabs');
const listContent = document.getElementById('listContent');
const customListBtn = document.getElementById('customListBtn');
const customFoodModal = new bootstrap.Modal(document.getElementById('customFoodModal'));
const resultModal = new bootstrap.Modal(document.getElementById('resultModal'));
const selectedFoodElement = document.getElementById('selectedFood');
const decideBtn = document.getElementById('decideBtn');
const spinAgainBtn = document.getElementById('spinAgainBtn');
const saveCustomListBtn = document.getElementById('saveCustomList');
const listNameInput = document.getElementById('listName');
const foodItemsInput = document.getElementById('foodItems');

// 初始化应用
function init() {
    loadCustomListsFromStorage();
    renderListTabs();
    renderFoodList();
    drawWheel();

    // 事件监听
    spinButton.addEventListener('click', spin);
    customListBtn.addEventListener('click', () => customFoodModal.show());
    saveCustomListBtn.addEventListener('click', saveCustomList);
    decideBtn.addEventListener('click', () => resultModal.hide());
    spinAgainBtn.addEventListener('click', () => {
        resultModal.hide();
        spin();
    });
}

// 加载自定义列表
function loadCustomListsFromStorage() {
    const stored = localStorage.getItem('customFoodLists');
    if (stored) {
        customLists = JSON.parse(stored);
    }
}

// 保存自定义列表到本地存储
function saveCustomListsToStorage() {
    localStorage.setItem('customFoodLists', JSON.stringify(customLists));
}

// 渲染列表标签
function renderListTabs() {
    const tabs = [
        { id: 'sichuan', name: '四川美食', icon: 'bi-geo-alt-fill' },
        { id: 'snack', name: '小吃快餐', icon: 'bi-cup-straw' },
        { id: 'restaurant', name: '饭店类型', icon: 'bi-shop' },
        { id: 'drink', name: '饮品甜点', icon: 'bi-cup-hot-fill' },
        ...customLists.map(list => ({ id: list.id, name: list.name, icon: 'bi-bookmark-star-fill' }))
    ];

    listTabs.innerHTML = tabs.map(tab => 
        `<button class="tab-button ${tab.id === 'sichuan' ? 'active' : ''}" data-list-id="${tab.id}">
            <i class="bi ${tab.icon}"></i> ${tab.name}
        </button>`
    ).join('');

    // 添加标签点击事件
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const listId = this.dataset.listId;
            switchFoodList(listId);
        });
    });
}

// 切换食物列表
function switchFoodList(listId) {
    switch(listId) {
        case 'sichuan':
            currentFoodList = [...sichuanFoods];
            break;
        case 'snack':
            currentFoodList = [...snackFoods];
            break;
        case 'restaurant':
            currentFoodList = [...restaurantFoods];
            break;
        case 'drink':
            currentFoodList = [...drinkFoods];
            break;
        default:
            // 自定义列表
            const customList = customLists.find(list => list.id === listId);
            if (customList) {
                currentFoodList = [...customList.items];
            }
    }

    renderFoodList();
    drawWheel();
}

// 渲染食物列表
function renderFoodList() {
    listContent.innerHTML = currentFoodList.map(food => 
        `<div class="food-item">
            <i class="bi bi-check-circle-fill"></i> ${food}
        </div>`
    ).join('');
}

// 绘制转盘
function drawWheel() {
    const centerX = wheelCanvas.width / 2;
    const centerY = wheelCanvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    // 清空画布
    ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);

    // 食物数量
    const foodCount = currentFoodList.length;
    if (foodCount === 0) return;

    // 每个扇形的角度
    const anglePerSection = (2 * Math.PI) / foodCount;

    // 绘制扇形
    currentFoodList.forEach((food, index) => {
        // 计算起始和结束角度
        const startAngle = index * anglePerSection - Math.PI / 2;
        const endAngle = (index + 1) * anglePerSection - Math.PI / 2;

        // 绘制扇形
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();

        // 设置填充颜色
        const hue = (index * 360 / foodCount) % 360;
        ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
        ctx.fill();

        // 绘制边框
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 绘制文字
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + anglePerSection / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Microsoft YaHei';
        ctx.fillText(food, radius - 10, 5);
        ctx.restore();
    });

    // 绘制中心圆
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#e63946';
    ctx.lineWidth = 3;
    ctx.stroke();
}

// 转动转盘
function spin() {
    if (isSpinning || currentFoodList.length === 0) return;

    isSpinning = true;
    spinButton.classList.add('spinning');

    // 随机选择一个食物
    const selectedFoodIndex = Math.floor(Math.random() * currentFoodList.length);
    const selectedFood = currentFoodList[selectedFoodIndex];

    // 计算需要旋转的角度
    const anglePerSection = 360 / currentFoodList.length;
    // 指针指向扇形中心，而不是扇形边缘
    const selectedAngle = selectedFoodIndex * anglePerSection + anglePerSection / 2;
    const randomAngle = 360 * 5 + (360 - selectedAngle); // 转5圈再加对齐角度

    // 应用旋转动画
    wheelCanvas.style.transform = `rotate(${randomAngle}deg)`;
    wheelCanvas.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)';

    // 动画结束后显示结果
    setTimeout(() => {
        isSpinning = false;
        spinButton.classList.remove('spinning');

        // 显示结果
        selectedFoodElement.textContent = selectedFood;
        resultModal.show();

        // 重置转盘状态，但不重置视觉状态
        setTimeout(() => {
            wheelCanvas.style.transition = 'none';
            const currentRotation = randomAngle % 360;
            wheelCanvas.style.transform = `rotate(${currentRotation}deg)`;
        }, 500);
    }, 4000);
}

// 保存自定义列表
function saveCustomList() {
    const listName = listNameInput.value.trim();
    const foodItems = foodItemsInput.value
        .split('\n')
        .map(item => item.trim())
        .filter(item => item !== '');

    if (!listName || foodItems.length === 0) {
        alert('请输入列表名称和至少一个食物项目');
        return;
    }

    // 生成唯一ID
    const id = 'custom_' + Date.now();

    // 添加到自定义列表
    customLists.push({
        id,
        name: listName,
        items: foodItems
    });

    // 保存到本地存储
    saveCustomListsToStorage();

    // 更新UI
    renderListTabs();

    // 清空表单并关闭模态框
    listNameInput.value = '';
    foodItemsInput.value = '';
    customFoodModal.hide();

    // 切换到新创建的列表
    setTimeout(() => {
        document.querySelector(`[data-list-id="${id}"]`).click();
    }, 300);
}

// 初始化应用
init();