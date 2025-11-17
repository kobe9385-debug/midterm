/*
By Okazz 2025
*/
let palette = ['#fed766', '#009fb7', '#eff1f3', '#e01a4f', '#f15946', '#193680', '#277AEE'];
let ctx;
let centerX, centerY;
let shapes = [];
let cornerImage;

// --- 選單變數 ---
let menuX;
let menuRenderData = []; // 用於儲存渲染後的選單項目的位置和數據
const menuWidth = 250; // 選單寬度
const menuConfig = [
	{
		label: '每週作品',
		submenu: [
			{ label: '第一單元作品', url: 'https://kobe9385-debug.github.io/20251020/' }
		]
	},
	{
		label: '每週筆記',
		submenu: [
			{ label: '第一單元講義', url: 'https://hackmd.io/@KN034512/B1punJ96ll' },
			{ label: '期中筆記', url: 'https://hackmd.io/@KN034512/Hy9q3aR1-l' }
		]
	},
	{
		label: '測驗系統',
		url: 'https://kobe9385-debug.github.io/202501103/'
	},
	{
		label: 'GITHUB', // 取消了頂層連結
		submenu: [ // 新增子導覽列
			{ label: '10/20', url: 'https://github.com/kobe9385-debug/20251020', target: '_blank' }, // 以新視窗開啟
			{ label: '10/27', url: 'https://github.com/kobe9385-debug/20251027', target: '_blank' },
			{ label: '11/03', url: 'https://github.com/kobe9385-debug/202501103', target: '_blank' },
			{ label: '11/10', url: 'https://github.com/kobe9385-debug/20251110', target: '_blank' },
			{ label: '期中專案', url: 'https://github.com/kobe9385-debug/-', target: '_blank' }
		]
	},
	{
		label: '淡江大學',
		submenu: [
			{ label: '淡江大學首頁', url: 'https://www.tku.edu.tw/' },
			{ label: '教育科技學系', url: 'https://www.et.tku.edu.tw/' }
		]
	}
];
let openSubmenus = {}; // 追蹤展開的子選單
const mobileBreakpoint = 768; // 行動裝置斷點
let isMobileView = false;
let isMenuOpen = false;
const triggerArea = 200; // 觸發選單的區域寬度
// -----------------

function preload() {
	cornerImage = loadImage('Screenshot_20240919_021400.jpg');
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	document.body.style.backgroundColor = '#000';
	rectMode(CENTER);
	colorMode(HSB, 360, 100, 100, 100);
	ctx = drawingContext;
	centerX = width / 2;
	centerY = height / 2;

	// 初始化選單位置為隱藏狀態
	menuX = -menuWidth;
	isMobileView = windowWidth < mobileBreakpoint;

	tiling();
}

function draw() {
	background('#050404');

	// 更新並顯示圖形
	for (let i of shapes) {
		i.run();
	}

	// --- 在主畫面中央靠左新增文字 ---
	push();
	// 計算文字的 X 座標
	// --- 動畫設定 ---
	const flyInDuration = 1500; // 飛入時間 (ms)
	const hoverDuration = 3000; // 懸停時間 (ms)
	const flyOutDuration = 1500; // 飛出時間 (ms)
	const totalDuration = flyInDuration + hoverDuration + flyOutDuration;
	const timeInCycle = millis() % totalDuration;

	// --- 計算文字框尺寸 ---
	textSize(150);
	textFont('LXGW WenKai TC');
	const titleText = "實作網頁";
	const titleWidth = textWidth(titleText);
	const titleHeight = textSize();
	const padding = 40;
	const boxWidth = titleWidth + 2 * padding;

	// --- 計算動畫屬性 ---
	const startX = -boxWidth;
	const centerXPos = lerp(menuWidth + 50, centerX, 0.6);
	const endX = width + boxWidth;
	let titleX;
	let titleAlpha;

	if (timeInCycle < flyInDuration) {
		// 階段 1: 從左側飛入
		const t = timeInCycle / flyInDuration;
		const easedT = 1 - Math.pow(1 - t, 3); // easeOutCubic
		titleX = lerp(startX, centerXPos, easedT);
		titleAlpha = easedT;
	} else if (timeInCycle < flyInDuration + hoverDuration) {
		// 階段 2: 懸停
		titleX = centerXPos;
		titleAlpha = 1;
	} else {
		// 階段 3: 向右側飛出
		const t = (timeInCycle - flyInDuration - hoverDuration) / flyOutDuration;
		const easedT = t * t * t; // easeInCubic
		titleX = lerp(centerXPos, endX, easedT);
		titleAlpha = 1 - easedT;
	}

	// --- 繪製文字背景 ---
	// 繪製帶有透明度的背景和文字
	noStroke();
	fill(0, 0, 15, 80 * titleAlpha); // HSB 模式下的深灰色
	rectMode(CENTER);
	rect(titleX, centerY, boxWidth, titleHeight + padding, 20);
	fill(0, 0, 100, 100 * titleAlpha); // HSB 模式下的白色
	textAlign(CENTER, CENTER);
	text(titleText, titleX, centerY);
	pop();

	// --- 嵌入圖片 ---
	if (cornerImage) {
		// 1. 計算新尺寸
		let imgHeight = height * 0.55; // 55% 的視窗高度
		let aspectRatio = cornerImage.width / cornerImage.height;
		let imgWidth = imgHeight * aspectRatio;

		// 2. 計算新位置
		let imgX = width - imgWidth - 30; // 靠右並留 30px 邊距
		let imgY = (height - imgHeight) / 2; // 垂直置中
		image(cornerImage, imgX, imgY, imgWidth, imgHeight);

		// --- 在照片左側顯示文字 ---
		push();
		const textX = imgX - 40; // 文字的 X 座標 (在圖片左邊再加 40px 間距)
		const textY = centerY;     // 文字的 Y 座標 (垂直置中)

		// --- 計算文字框尺寸 ---
		textSize(40);
		const textLines = ["淡江大學", "教育科技學系", "李睿鈞", "414730209"];
		let maxWidth = 0;
		textLines.forEach(line => {
			const w = textWidth(line);
			if (w > maxWidth) {
				maxWidth = w;
			}
		});
		const textPadding = 30;
		const textBoxWidth = maxWidth + 2 * textPadding;
		const textBoxHeight = imgHeight * 0.8; // 方框高度為照片高度的 80%
		const boxX = textX - maxWidth / 2; // 方框的中心 X
		const boxY = textY;                 // 方框的中心 Y

		// --- 繪製文字背景 ---
		fill(20, 80); // 與導覽列相同的半透明深灰色
		noStroke();
		rectMode(CENTER); // 確保使用中心點模式繪製方框
		rect(boxX, boxY, textBoxWidth, textBoxHeight, 20); // 圓角半徑改為 20

		// --- 繪製文字 ---
		const lineHeight = 50; // 設定一個固定的行高

		fill(255); // 白色文字
		textAlign(RIGHT, CENTER); // 文字靠右、垂直置中對齊

		text("淡江大學", textX, textY - 1.5 * lineHeight);
		text("教育科技學系", textX, textY - 0.5 * lineHeight);
		text("李睿鈞", textX, textY + 0.5 * lineHeight);
		text("414730209", textX, textY + 1.5 * lineHeight);
		pop();
	}

	// --- 選單邏輯 ---
	let targetMenuX;
	if (isMobileView) {
		// 行動裝置模式：根據 isMenuOpen 狀態決定選單位置
		targetMenuX = isMenuOpen ? 0 : -menuWidth;
		drawHamburgerIcon();
	} else {
		// 桌面模式：根據滑鼠位置決定選單的目標位置
		targetMenuX = (mouseX < triggerArea && mouseX > 0) ? 0 : -menuWidth;
	}

	// 使用 lerp 函數讓選單平滑移動
	menuX = lerp(menuX, targetMenuX, 0.1);

	// 繪製選單
	drawMenu();
	
	// --- 滑鼠指標邏輯 ---
	let onMenuItem = false;
	let onHamburger = false;

	if (isMobileView) {
		// 行動裝置模式下，檢查是否在漢堡圖示上
		if (mouseX < 60 && mouseY < 60) {
			onHamburger = true;
		}
	}

	// 檢查滑鼠是否在選單項目上 (不論模式，只要選單是展開的)
	// menuX > -menuWidth + 1 避免在選單完全收合時還觸發
	if (menuX > -menuWidth + 1 && mouseX < menuX + menuWidth) {
		// 檢查是否在選單項目上
		for (const item of menuRenderData) {
			if (mouseY > item.top && mouseY < item.bottom) {
				onMenuItem = true;
				break;
			}
		}
	}

	// 根據是否在選項上改變滑鼠指標
	if (onMenuItem || onHamburger) {
		cursor(HAND);
	} else {
		cursor(ARROW);
	}
	// -----------------
}

function tiling() {
	let c = 15;
	let w = width / c;
	for (let i = -1.5; i < c; i += cos(PI / 6)) {
		for (let j = -1; j <= c; j += cos(PI / 3) * 3) {
			let x = i * w + w / 2;
			let y = j * w + w / 2;
			shapes.push(new Shape(x, y, w));
			shapes.push(new Shape(x + w / 2 * cos(PI / 6), y + w * 1.5 * cos(PI / 3), w));
		}
	}
}

function drawMenu() {
	push();
	// 重置渲染數據
	menuRenderData = [];

	// 將原點移到選單的當前位置
	translate(menuX, 0);

	// 根據選單位置計算透明度 (0.0 to 1.0)
	// map(value, start1, stop1, start2, stop2)
	// 當 menuX 從 -menuWidth 變到 0 時，alpha 從 0 變到 1
	let alpha = map(menuX, -menuWidth, 0, 0, 1);

	// 繪製選單背景
	fill(20, 80 * alpha); // 套用透明度
	noStroke();
	rectMode(CORNER);
	rect(0, 0, menuWidth, height);

	// --- 繪製巢狀選單 ---
	let yPos = 40;
	const itemHeight = 50;
	const subItemIndent = 20;

	textAlign(LEFT, TOP);

	menuConfig.forEach(item => {
		// 繪製主選單項
		drawMenuItem(item, 20, yPos, itemHeight, alpha);
		yPos += itemHeight;

		// 如果子選單是展開的，則繪製子選單項
		if (item.submenu && openSubmenus[item.label]) {
			item.submenu.forEach(subItem => {
				drawMenuItem(subItem, 20 + subItemIndent, yPos, itemHeight, alpha);
				yPos += itemHeight;
			});
		}
	});

	pop();
}

// 輔助函式：繪製單個選單項
function drawMenuItem(item, x, y, h, globalAlpha) {
	const itemTop = y;
	const itemBottom = y + h;
	const label = '• ' + (item.submenu ? (openSubmenus[item.label] ? '▾ ' : '▸ ') + item.label : item.label);

	// 檢查滑鼠是否懸停
	let isHovering = mouseX > menuX + x && mouseX < menuX + menuWidth && mouseY > itemTop && mouseY < itemBottom;
	if (isHovering) {		
		// HSB 模式下的紅色: H(0-360), S(0-100), B(0-100), A(0-100)
		// 色相0為紅色，飽和度與亮度設為100
		fill(0, 100, 100, 100 * globalAlpha);
	} else {
		// HSB 模式下的白色: 飽和度為0，亮度為100
		fill(0, 0, 100, 75 * globalAlpha);
	}
	textSize(item.submenu ? 22 : 20); // 主選單字體大一點
	text(label, x, y + h / 4);

	// 儲存渲染數據以供點擊檢測
	if (item.url || item.submenu) {
		menuRenderData.push({ top: itemTop, bottom: itemBottom, item: item });
	}
}

function drawHamburgerIcon() {
	push();
	stroke(255);
	strokeWeight(3);
	// 根據選單是否開啟，繪製不同圖示 (漢堡或 'X')
	if (isMenuOpen) {
		// 繪製 'X'
		line(20, 20, 40, 40);
		line(40, 20, 20, 40);
	} else {
		// 繪製三條線
		line(20, 25, 40, 25);
		line(20, 35, 40, 35);
		line(20, 45, 40, 45);
	}
	pop();
}

function mousePressed() {
	if (isMobileView) {
		// 在行動裝置模式下，檢查是否點擊漢堡圖示
		if (mouseX < 60 && mouseY < 60) {
			isMenuOpen = !isMenuOpen; // 切換選單狀態
			return; // 點擊漢堡圖示後，不需要再檢查下面的選單項目
		}
	}

	// 檢查選單是否可見 (menuX > -menuWidth 代表選單已滑出或正在滑出)
	// 並且滑鼠在選單的寬度範圍內
	// menuX > -menuWidth + 1 避免在選單動畫剛開始時誤觸
	if (menuX > -menuWidth + 1 && mouseX < menuX + menuWidth) {
		for (const renderedItem of menuRenderData) {
			if (mouseY > renderedItem.top && mouseY < renderedItem.bottom) {
				const clickedItem = renderedItem.item;

				if (clickedItem.submenu) {
					// 如果點擊的是有子選單的項目，切換其展開狀態
					openSubmenus[clickedItem.label] = !openSubmenus[clickedItem.label];
				} else if (clickedItem.url) {
					// 如果點擊的是有 URL 的項目
					if (clickedItem.target === '_blank') {
						window.open(clickedItem.url, '_blank'); // 在新分頁開啟
					} else {
						showIframe(clickedItem.url); // 在 iframe 中開啟
					}
					// 在行動裝置模式下，點擊選項後自動關閉選單
					if (isMobileView) {
						isMenuOpen = false;
					}
				}
				return; // 點擊後即停止檢查
			}
		}
	}
}

function showIframe(url) {
	// 如果 iframe 已經存在，就不要再建立了
	if (document.getElementById('content-iframe')) {
		return;
	}

	// 建立 iframe 元素
	let iframe = document.createElement('iframe');
	iframe.id = 'content-iframe';
	iframe.src = url;
	// 設定 iframe 樣式
	iframe.style.position = 'fixed';
	iframe.style.top = '50%';
	iframe.style.left = '50%';
	iframe.style.transform = 'translate(-50%, -50%)';
	iframe.style.width = '70vw'; // 寬度改為 70% 視窗寬
	iframe.style.height = '85vh'; // 高度改為 85% 視窗高
	iframe.style.border = '2px solid #fed766';
	iframe.style.zIndex = '100'; // 確保在 canvas 之上

	// 建立關閉按鈕
	let closeButton = document.createElement('button');
	closeButton.id = 'close-button';
	closeButton.innerText = 'X';
	// 設定按鈕樣式
	closeButton.style.position = 'fixed';
	closeButton.style.top = 'calc(7.5vh - 20px)'; // (100vh - 85vh)/2 = 7.5vh
	closeButton.style.right = 'calc(15vw - 20px)'; // (100vw - 70vw)/2 = 15vw
	closeButton.style.zIndex = '101'; // 在 iframe 之上
	closeButton.style.cursor = 'pointer';

	// 設定關閉按鈕的點擊事件
	closeButton.onclick = () => {
		document.body.removeChild(iframe);
		document.body.removeChild(closeButton);
	};

	// 將 iframe 和按鈕加入到 body 中
	document.body.appendChild(iframe);
	document.body.appendChild(closeButton);
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	centerX = width / 2;
	centerY = height / 2;
	isMobileView = windowWidth < mobileBreakpoint;

	// 如果從桌面版切換到行動版，且選單是打開的，就關閉它
	if (isMobileView) {
		isMenuOpen = false;
	}
	// 重新生成圖形以適應新畫布
	shapes = [];
	tiling();
}
/*------------------------------------------------------------------------------------------*/


class Shape {
	constructor(x, y, w) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.currentW = w;
		this.shapeType = 0;
		let dst = dist(centerX, centerY, x, y);
		this.timer = -int(map(dst, 0, sqrt(sq(width/2) + sq(height/2)), 100, 0));
		this.t1 = 30;
		this.t2 = this.t1 + 30;
		this.t3 = this.t2 + 120;
		this.clr = random(palette);
	}

	show() {
		push();
		translate(this.x, this.y);
		rotate(PI / 6);
		fill(this.clr);
		noStroke();
		if (this.shapeType == 0) {
			beginShape();
			for (let a = 0; a < TAU; a += (TAU / 6)) {
				vertex(this.currentW * 0.5 * cos(a), this.currentW * 0.5 * sin(a));
			}
			endShape();
		} else if (this.shapeType == 1) {
			circle(0, 0, this.currentW * 0.5);
		} else if (this.shapeType == 2) {
			rect(0, 0, this.currentW * 0.75, this.currentW * 0.9);
		} else if (this.shapeType == 3) {
			beginShape();
			for (let a = 0; a < TAU; a += (TAU / 3)) {
				vertex(this.currentW * 0.5 * cos(a), this.currentW * 0.5 * sin(a));
			}
			endShape();
		}

		noStroke();
		fill('#00000050');
		pop();
	}

	update() {
		if (0 < this.timer && this.timer < this.t1) {
			let nrm = norm(this.timer, 0, this.t1 - 1);
			this.currentW = lerp(this.w, this.w * 0.2, nrm ** 3);
		} else if (this.t1 < this.timer && this.timer < this.t2) {
			let nrm = norm(this.timer, this.t1, this.t2 - 1);
			this.currentW = lerp(this.w * 0.2, this.w, nrm ** (1 / 3));
		}
		if (this.timer == this.t1) {
			this.shapeType++;
			if (this.shapeType == 4) {
				this.shapeType = 0;
			}
			this.clr = random(palette);

		}
		if (this.timer > this.t3) {
			this.timer = 0;
		}
		this.timer++;
	}

	run() {
		this.show();
		this.update();
	}
}
