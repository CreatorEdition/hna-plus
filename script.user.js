// ==UserScript==
// @name         海南航空-海航PLUS航线搜索增强
// @name:en      HNA PLUS Flight Search Enhanced
// @namespace    https://itrip.cc/
// @version      0.1.0
// @description  为海航PLUS会员权益卡航班列表添加搜索功能：出发地查询、目的地查询、智能环线规划（增量显示）
// @description:en  Enhanced search for HNA PLUS flight list: departure/arrival query and loop route planning
// @author       Orrin
// @homepage     https://github.com/CreatorEdition/hna-plus
// @supportURL   https://github.com/CreatorEdition/hna-plus/issues
// @icon         https://m.hnair.com/favicon.ico
// @match        https://m.hnair.com/cms/me/plus/info/202508/t20250808_78914.html*
// @license      MIT
// @updateURL    https://update.itrip.cc/hna-plus/script.meta.js
// @downloadURL  https://update.itrip.cc/hna-plus/script.user.js
// @grant        none
// @run-at       document-end
// @compatible   chrome 支持最新版 Chrome
// @compatible   firefox 支持最新版 Firefox
// @compatible   edge 支持最新版 Edge
// ==/UserScript==
 
(function () {
    'use strict';
 
    // 添加到脚本开头
    const UPDATE_CONFIG = {
        currentVersion: '0.1.0',
        checkInterval: 24 * 60 * 60 * 1000 // 24小时检查一次
    };
 
    // 省份-城市映射表
    const PROVINCE_CITIES = {
        '北京': ['北京'],
        '上海': ['上海'],
        '天津': ['天津'],
        '重庆': ['重庆'],
        '广东': ['广州', '深圳', '珠海', '汕头', '佛山', '韶关', '湛江', '肇庆', '江门', '茂名', '惠州', '梅州', '汕尾', '河源', '阳江', '清远', '东莞', '中山', '潮州', '揭阳', '云浮'],
        '江苏': ['南京', '无锡', '徐州', '常州', '苏州', '南通', '连云港', '淮安', '盐城', '扬州', '镇江', '泰州', '宿迁'],
        '浙江': ['杭州', '宁波', '温州', '嘉兴', '湖州', '绍兴', '金华', '衢州', '舟山', '台州', '丽水'],
        '山东': ['济南', '青岛', '淄博', '枣庄', '东营', '烟台', '潍坊', '济宁', '泰安', '威海', '日照', '临沂', '德州', '聊城', '滨州', '菏泽'],
        '河南': ['郑州', '开封', '洛阳', '平顶山', '安阳', '鹤壁', '新乡', '焦作', '濮阳', '许昌', '漯河', '三门峡', '南阳', '商丘', '信阳', '周口', '驻马店'],
        '河北': ['石家庄', '唐山', '秦皇岛', '邯郸', '邢台', '保定', '张家口', '承德', '沧州', '廊坊', '衡水'],
        '湖北': ['武汉', '黄石', '十堰', '宜昌', '襄阳', '鄂州', '荆门', '孝感', '荆州', '黄冈', '咸宁', '随州', '恩施'],
        '湖南': ['长沙', '株洲', '湘潭', '衡阳', '邵阳', '岳阳', '常德', '张家界', '益阳', '郴州', '永州', '怀化', '娄底', '湘西'],
        '四川': ['成都', '自贡', '攀枝花', '泸州', '德阳', '绵阳', '广元', '遂宁', '内江', '乐山', '南充', '眉山', '宜宾', '广安', '达州', '雅安', '巴中', '资阳', '阿坝', '甘孜', '凉山'],
        '福建': ['福州', '厦门', '莆田', '三明', '泉州', '漳州', '南平', '龙岩', '宁德'],
        '安徽': ['合肥', '芜湖', '蚌埠', '淮南', '马鞍山', '淮北', '铜陵', '安庆', '黄山', '滁州', '阜阳', '宿州', '六安', '宣城', '池州', '亳州'],
        '江西': ['南昌', '景德镇', '萍乡', '九江', '新余', '鹰潭', '赣州', '吉安', '宜春', '抚州', '上饶'],
        '辽宁': ['沈阳', '大连', '鞍山', '抚顺', '本溪', '丹东', '锦州', '营口', '阜新', '辽阳', '盘锦', '铁岭', '朝阳', '葫芦岛'],
        '吉林': ['长春', '吉林', '四平', '辽源', '通化', '白山', '松原', '白城', '延边'],
        '黑龙江': ['哈尔滨', '齐齐哈尔', '鸡西', '鹤岗', '双鸭山', '大庆', '伊春', '佳木斯', '七台河', '牡丹江', '黑河', '绥化', '大兴安岭'],
        '山西': ['太原', '大同', '阳泉', '长治', '晋城', '朔州', '晋中', '运城', '忻州', '临汾', '吕梁'],
        '陕西': ['西安', '铜川', '宝鸡', '咸阳', '渭南', '延安', '汉中', '榆林', '安康', '商洛'],
        '甘肃': ['兰州', '嘉峪关', '金昌', '白银', '天水', '武威', '张掖', '平凉', '酒泉', '庆阳', '定西', '陇南', '临夏', '甘南'],
        '青海': ['西宁', '海东', '海北', '黄南', '海南', '果洛', '玉树', '海西'],
        '云南': ['昆明', '曲靖', '玉溪', '保山', '昭通', '丽江', '普洱', '临沧', '楚雄', '红河', '文山', '西双版纳', '大理', '德宏', '怒江', '迪庆'],
        '贵州': ['贵阳', '六盘水', '遵义', '安顺', '毕节', '铜仁', '黔西南', '黔东南', '黔南'],
        '广西': ['南宁', '柳州', '桂林', '梧州', '北海', '防城港', '钦州', '贵港', '玉林', '百色', '贺州', '河池', '来宾', '崇左'],
        '海南': ['海口', '三亚', '三沙', '儋州', '五指山', '琼海', '文昌', '万宁', '东方'],
        '内蒙古': ['呼和浩特', '包头', '乌海', '赤峰', '通辽', '鄂尔多斯', '呼伦贝尔', '巴彦淖尔', '乌兰察布', '兴安', '锡林郭勒', '阿拉善'],
        '宁夏': ['银川', '石嘴山', '吴忠', '固原', '中卫'],
        '新疆': ['乌鲁木齐', '克拉玛依', '吐鲁番', '哈密', '昌吉', '博尔塔拉', '巴音郭楞', '阿克苏', '克孜勒苏', '喀什', '和田', '伊犁', '塔城', '阿勒泰'],
        '西藏': ['拉萨', '日喀则', '昌都', '林芝', '山南', '那曲', '阿里'],
        '香港': ['香港'],
        '澳门': ['澳门'],
        '台湾': ['台北', '高雄', '台中', '台南', '基隆', '新竹', '嘉义']
    };
 
    // 解析航班数据
    function parseFlightData() {
        const flights = [];
        const rows = document.querySelectorAll('table tbody tr');
 
        for (let i = 1; i < rows.length; i++) {
            const cells = rows[i].querySelectorAll('td');
            if (cells.length >= 6) {
                flights.push({
                    flightNo: cells[0].textContent.trim(),
                    departure: cells[1].textContent.trim(),
                    arrival: cells[2].textContent.trim(),
                    departureTime: cells[3].textContent.trim(),
                    schedule: cells[4].textContent.trim(),
                    product: cells[5].textContent.trim()
                });
            }
        }
        return flights;
    }
 
    // 根据搜索关键词获取城市列表（支持省份）
    function getCitiesByKeyword(keyword) {
        keyword = keyword.trim();
 
        // 如果是省份，返回该省所有城市
        if (PROVINCE_CITIES[keyword]) {
            return PROVINCE_CITIES[keyword];
        }
 
        // 否则返回单个城市
        return [keyword];
    }
 
    // 根据出发地查找所有目的地
    function findDestinations(flights, departures) {
        return flights.filter(f => departures.includes(f.departure));
    }
 
    // 根据目的地反向查找所有出发地
    function findDepartures(flights, arrivals) {
        return flights.filter(f => arrivals.includes(f.arrival));
    }
 
    // 构建航线图（邻接表）
    function buildFlightGraph(flights) {
        const graph = {};
 
        flights.forEach(flight => {
            if (!graph[flight.departure]) {
                graph[flight.departure] = [];
            }
            graph[flight.departure].push({
                to: flight.arrival,
                flight: flight
            });
        });
 
        return graph;
    }
 
    // 增量查找环线路线（使用生成器）
    function* findLoopRoutesGenerator(flights, startCity, maxStops = 3) { //maxStops =4 的话就可以  A-B-C-D-A 但是这种太多了
        const graph = buildFlightGraph(flights);
 
        // 检查起点是否存在
        if (!graph[startCity]) {
            return;
        }
 
        function canReturnToStart(city) {
            return graph[city] && graph[city].some(edge => edge.to === startCity);
        }
 
        function* dfs(currentCity, path, visited, depth) {
            // 深度限制
            if (depth >= maxStops) return;
 
            // 如果当前城市可以返回起点，yield 这条路线
            if (depth >= 2 && canReturnToStart(currentCity)) {
                const returnFlight = graph[currentCity].find(edge => edge.to === startCity);
                yield {
                    path: [...path],
                    returnFlight: returnFlight.flight,
                    totalStops: depth + 1
                };
            }
 
            // 继续探索
            if (!graph[currentCity]) return;
 
            for (const edge of graph[currentCity]) {
                const nextCity = edge.to;
 
                // 避免重复访问（除了起点）
                if (nextCity !== startCity && visited.has(nextCity)) continue;
 
                visited.add(nextCity);
                path.push({
                    from: currentCity,
                    to: nextCity,
                    flight: edge.flight
                });
 
                yield* dfs(nextCity, path, visited, depth + 1);
 
                path.pop();
                visited.delete(nextCity);
            }
        }
 
        const visited = new Set([startCity]);
        yield* dfs(startCity, [], visited, 0);
    }
 
    // 创建搜索界面
    function createSearchUI(flights) {
        // 获取所有唯一城市
        const cities = new Set();
        flights.forEach(f => {
            cities.add(f.departure);
            cities.add(f.arrival);
        });
        const cityList = Array.from(cities).sort();
 
        const searchPanel = document.createElement('div');
        searchPanel.id = 'flight-search-panel';
        searchPanel.style.cssText = `
            position: sticky;
            top: 0;
            background: #fff;
            padding: 20px;
            border: 2px solid #0066cc;
            border-radius: 10px;
            margin: 20px 0;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
        `;
 
        searchPanel.innerHTML = `
            <h2 style="margin-top:0; color:#0066cc;">🔍 航线搜索工具</h2>
 
            <div style="margin-bottom: 15px;">
                <label style="font-weight:bold; margin-right:10px;">查询方式：</label>
                <select id="search-mode" style="padding:8px; border-radius:5px; border:1px solid #ccc;">
                    <option value="departure">出发地查询</option>
                    <option value="arrival">目的地查询</option>
                    <option value="loop">环线规划</option>
                </select>
            </div>
 
            <div style="margin-bottom: 15px;">
                <label style="font-weight:bold; margin-right:10px;">输入城市或省份：</label>
                <input type="text" id="city-input" placeholder="例如：深圳 或 广东"
                    style="padding:8px; border-radius:5px; border:1px solid #ccc; width:200px;"
                    list="city-suggestions">
                <datalist id="city-suggestions">
                    ${cityList.map(city => `<option value="${city}">`).join('')}
                    ${Object.keys(PROVINCE_CITIES).map(prov => `<option value="${prov}">`).join('')}
                </datalist>
 
                <button id="search-btn" style="padding:8px 20px; margin-left:10px; background:#0066cc; color:#fff; border:none; border-radius:5px; cursor:pointer;">
                    搜索
                </button>
 
                <button id="clear-btn" style="padding:8px 20px; margin-left:10px; background:#666; color:#fff; border:none; border-radius:5px; cursor:pointer;">
                    清除结果
                </button>
            </div>
 
            <div id="search-result" style="margin-top:20px; max-height: 70vh; overflow-y: auto; border: 1px solid #ddd; border-radius: 5px; padding: 10px; background: #f9f9f9;"></div>
        `;
 
        // 在表格前插入搜索面板
        const table = document.querySelector('table');
        if (table) {
            table.parentNode.insertBefore(searchPanel, table);
        }
 
        // 绑定事件
        document.getElementById('search-btn').addEventListener('click', () => {
            const mode = document.getElementById('search-mode').value;
            const keyword = document.getElementById('city-input').value;
 
            if (!keyword) {
                alert('请输入城市或省份名称！');
                return;
            }
 
            performSearch(flights, mode, keyword);
        });
 
        document.getElementById('clear-btn').addEventListener('click', () => {
            document.getElementById('search-result').innerHTML = '';
            document.getElementById('city-input').value = '';
        });
 
        // 支持回车键搜索
        document.getElementById('city-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('search-btn').click();
            }
        });
    }
 
    // 执行搜索
    function performSearch(flights, mode, keyword) {
        const resultDiv = document.getElementById('search-result');
        const cities = getCitiesByKeyword(keyword);
 
        // 检查城市/省份是否有效
        const allCities = new Set();
        flights.forEach(f => {
            allCities.add(f.departure);
            allCities.add(f.arrival);
        });
 
        const validCities = cities.filter(city => allCities.has(city));
 
        if (validCities.length === 0) {
            resultDiv.innerHTML = `<p style="color:#dc3545;">❌ 未找到与"${keyword}"相关的航班数据</p>`;
            return;
        }
 
        let html = '';
        let isProvince = PROVINCE_CITIES[keyword] !== undefined;
 
        if (mode === 'departure') {
            const results = findDestinations(flights, validCities);
 
            if (isProvince) {
                html = `<h3>从 <span style="color:#0066cc;">${keyword}</span> 省/市出发的航班（共 ${results.length} 条）：</h3>`;
                html += `<p style="color:#666;">包含城市：${validCities.join('、')}</p>`;
            } else {
                html = `<h3>从 <span style="color:#0066cc;">${keyword}</span> 出发的航班（共 ${results.length} 条）：</h3>`;
            }
 
            html += formatFlightTable(results);
            resultDiv.innerHTML = html;
 
        } else if (mode === 'arrival') {
            const results = findDepartures(flights, validCities);
 
            if (isProvince) {
                html = `<h3>到达 <span style="color:#0066cc;">${keyword}</span> 省/市的航班（共 ${results.length} 条）：</h3>`;
                html += `<p style="color:#666;">包含城市：${validCities.join('、')}</p>`;
            } else {
                html = `<h3>到达 <span style="color:#0066cc;">${keyword}</span> 的航班（共 ${results.length} 条）：</h3>`;
            }
 
            html += formatFlightTable(results);
            resultDiv.innerHTML = html;
 
        } else if (mode === 'loop') {
            // 环线规划只支持单个城市
            if (isProvince) {
                html = `<p style="color:#dc3545;">❌ 环线规划仅支持单个城市查询，不支持省份查询</p>`;
                resultDiv.innerHTML = html;
                return;
            }
 
            const startCity = validCities[0];
            performLoopSearch(flights, startCity, resultDiv);
        }
    }
 
    // 执行环线搜索（增量显示 - 按第一站分组，第三站可点击展开）
    async function performLoopSearch(flights, startCity, resultDiv) {
        resultDiv.innerHTML = `
        <h3>从 <span style="color:#0066cc;">${startCity}</span> 出发的环线规划：</h3>
        <div id="loop-progress" style="padding: 15px; background: #fff3cd; border-radius: 8px; margin-bottom: 15px;">
            <p style="margin:0;">⏳ 正在搜索环线路线... 已找到 <strong id="loop-count">0</strong> 条</p>
            <button id="stop-search-btn" style="margin-top:10px; padding:6px 15px; background:#dc3545; color:#fff; border:none; border-radius:5px; cursor:pointer;">
                停止搜索
            </button>
        </div>
        <div id="loop-results"></div>
    `;
 
        const loopResultsDiv = document.getElementById('loop-results');
        const loopCountSpan = document.getElementById('loop-count');
 
        let loopCount = 0;
        let shouldStop = false;
        const groupedBySecondCity = {}; // 按第二站（城市B）分组
 
        // 停止搜索按钮
        document.getElementById('stop-search-btn').addEventListener('click', () => {
            shouldStop = true;
            document.getElementById('loop-progress').innerHTML = `
            <p style="margin:0; color:#dc3545;">⏸️ 搜索已停止，共找到 <strong>${loopCount}</strong> 条环线</p>
        `;
        });
 
        // 使用生成器逐个处理结果
        const generator = findLoopRoutesGenerator(flights, startCity);
 
        function processNextLoop() {
            if (shouldStop) return;
 
                        const result = generator.next();
 
            if (result.done) {
                // 搜索完成
                document.getElementById('loop-progress').innerHTML = `
                <p style="margin:0; color:#28a745;">✅ 搜索完成！共找到 <strong>${loopCount}</strong> 条环线路线</p>
            `;
 
                if (loopCount === 0) {
                    loopResultsDiv.innerHTML = '<p style="color:#999;">❌ 未找到能返回起点的环线路线</p>';
                } else {
                    // 添加统计信息
                    const stats = document.createElement('div');
                    stats.style.cssText = 'margin-top: 20px; padding: 15px; background: #d4edda; border-radius: 8px; border-left: 4px solid #28a745;';
                    stats.innerHTML = `
                    <h4 style="margin-top:0;">📊 统计信息</h4>
                    <ul style="margin:0; padding-left: 20px;">
                        <li>总共找到 <strong>${loopCount}</strong> 条可行环线</li>
                        <li>从 <strong>${startCity}</strong> 可直飞 <strong>${Object.keys(groupedBySecondCity).length}</strong> 个城市形成环线</li>
                    </ul>
                `;
                    loopResultsDiv.appendChild(stats);
                }
                return;
            }
 
            // 处理找到的路线
            const loop = result.value;
            loopCount++;
            loopCountSpan.textContent = loopCount;
 
            // 获取第二站城市（城市B）
            const secondCity = loop.path[0].to;
            const thirdCity = loop.path[1].to;
 
            // 按第二站分组
            if (!groupedBySecondCity[secondCity]) {
                groupedBySecondCity[secondCity] = {
                    flight: loop.path[0].flight, // 第一段航班信息
                    destinations: new Map() // 使用 Map 存储第三站信息
                };
 
                // 创建新的分组容器
                const groupDiv = document.createElement('div');
                groupDiv.id = `loop-group-${secondCity.replace(/\s+/g, '-')}`;
                groupDiv.style.cssText = 'margin: 20px 0; padding: 15px; background: #e3f2fd; border-radius: 8px;';
                groupDiv.innerHTML = `
                <h4 style="margin-top:0; color:#1976d2;">
                    🔄 ${startCity} ➜ <span style="color:#0066cc;">${secondCity}</span> ➜ ? ➜ ${startCity}
                </h4>
                <div style="margin-bottom: 10px; padding: 10px; background: #fff; border-radius: 5px;">
                    <strong>第一段航班：</strong>${startCity} ➜ ${secondCity}<br>
                    <span style="color:#666;">航班号：${loop.path[0].flight.flightNo} | 起飞：${loop.path[0].flight.departureTime} | 班期：${loop.path[0].flight.schedule}</span>
                </div>
                <div style="margin-top: 10px;">
                    <strong>可选择的第三站（<span id="count-${secondCity.replace(/\s+/g, '-')}">0</span> 个）：</strong>
                    <div id="buttons-${secondCity.replace(/\s+/g, '-')}" style="margin-top: 10px;"></div>
                    <div id="details-${secondCity.replace(/\s+/g, '-')}" style="margin-top: 15px;"></div>
                </div>
            `;
                loopResultsDiv.appendChild(groupDiv);
            }
 
            // 检查是否已经添加过这个第三站
            if (!groupedBySecondCity[secondCity].destinations.has(thirdCity)) {
                groupedBySecondCity[secondCity].destinations.set(thirdCity, {
                    toThirdFlight: loop.path[1].flight,
                    returnFlight: loop.returnFlight
                });
 
                // 更新计数
                const safeSecondCity = secondCity.replace(/\s+/g, '-');
                document.getElementById(`count-${safeSecondCity}`).textContent = groupedBySecondCity[secondCity].destinations.size;
 
                // 添加城市按钮
                const buttonsDiv = document.getElementById(`buttons-${safeSecondCity}`);
                const cityBtn = document.createElement('button');
                cityBtn.id = `btn-${safeSecondCity}-${thirdCity.replace(/\s+/g, '-')}`;
                cityBtn.textContent = thirdCity;
                cityBtn.style.cssText = `
                padding: 8px 16px;
                margin: 5px;
                background: #fff;
                color: #0066cc;
                border: 2px solid #0066cc;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
                font-weight: bold;
                transition: all 0.3s;
            `;
 
                // 鼠标悬停效果
                cityBtn.onmouseover = () => {
                    if (!cityBtn.classList.contains('active')) {
                        cityBtn.style.background = '#e3f2fd';
                    }
                };
                cityBtn.onmouseout = () => {
                    if (!cityBtn.classList.contains('active')) {
                        cityBtn.style.background = '#fff';
                    }
                };
 
                // 点击事件
                cityBtn.onclick = () => {
                    const detailsDiv = document.getElementById(`details-${safeSecondCity}`);
                    const detailId = `detail-${safeSecondCity}-${thirdCity.replace(/\s+/g, '-')}`;
 
                    // 如果点击的是当前已展开的，就收起
                    if (cityBtn.classList.contains('active')) {
                        detailsDiv.innerHTML = '';
                        cityBtn.classList.remove('active');
                        cityBtn.style.background = '#fff';
                        cityBtn.style.color = '#0066cc';
                        return;
                    }
 
                    // 重置所有同组按钮的样式
                    const allButtons = buttonsDiv.querySelectorAll('button');
                    allButtons.forEach(btn => {
                        btn.classList.remove('active');
                        btn.style.background = '#fff';
                        btn.style.color = '#0066cc';
                    });
 
                    // 激活当前按钮
                    cityBtn.classList.add('active');
                    cityBtn.style.background = '#0066cc';
                    cityBtn.style.color = '#fff';
 
                    // 显示详细信息
                    const destInfo = groupedBySecondCity[secondCity].destinations.get(thirdCity);
                    detailsDiv.innerHTML = `
                    <div style="padding: 15px; background: #fff; border-radius: 8px; border-left: 4px solid #28a745;">
                        <div style="margin-bottom: 10px;">
                            <strong style="font-size: 16px; color: #28a745;">✓ ${thirdCity}</strong>
                            <span style="color:#666; font-size: 14px; margin-left: 10px;">
                                完整路线：${startCity} ➜ ${secondCity} ➜ ${thirdCity} ➜ ${startCity}
                            </span>
                        </div>
                        <table style="width:100%; border-collapse:collapse; font-size: 14px;">
                            <thead>
                                <tr style="background:#f5f5f5;">
                                    <th style="padding:8px; text-align:left; width:150px;">航段</th>
                                    <th style="padding:8px; text-align:left;">航班号</th>
                                    <th style="padding:8px; text-align:left;">起飞时刻</th>
                                    <th style="padding:8px; text-align:left;">班期</th>
                                    <th style="padding:8px; text-align:left;">产品</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="padding:8px;"><strong>${secondCity} ➜ ${thirdCity}</strong></td>
                                    <td style="padding:8px;">${destInfo.toThirdFlight.flightNo}</td>
                                    <td style="padding:8px;">${destInfo.toThirdFlight.departureTime}</td>
                                    <td style="padding:8px;">${destInfo.toThirdFlight.schedule}</td>
                                    <td style="padding:8px;">${destInfo.toThirdFlight.product}</td>
                                </tr>
                                <tr style="background:#e8f5e9;">
                                    <td style="padding:8px;"><strong>${thirdCity} ➜ ${startCity}</strong> <span style="color:#28a745;">✓ 返回</span></td>
                                    <td style="padding:8px;">${destInfo.returnFlight.flightNo}</td>
                                    <td style="padding:8px;">${destInfo.returnFlight.departureTime}</td>
                                    <td style="padding:8px;">${destInfo.returnFlight.schedule}</td>
                                    <td style="padding:8px;">${destInfo.returnFlight.product}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                `;
                };
 
                buttonsDiv.appendChild(cityBtn);
            }
 
            // 继续处理下一个结果（使用 setTimeout 避免阻塞）
            setTimeout(processNextLoop, 0);
        }
 
        // 开始处理
        processNextLoop();
    }
    // 格式化航班表格
    function formatFlightTable(flights) {
        if (flights.length === 0) {
            return '<p style="color:#999;">未找到相关航班</p>';
        }
 
        let html = '<div style="overflow-x:auto;">';
        html += '<table style="width:100%; border-collapse:collapse; background:#fff; min-width:600px;">';
        html += '<thead><tr style="background:#0066cc; color:#fff;">';
        html += '<th style="padding:10px; text-align:left;">航班号</th>';
        html += '<th style="padding:10px; text-align:left;">出发</th>';
        html += '<th style="padding:10px; text-align:left;">到达</th>';
        html += '<th style="padding:10px; text-align:left;">起飞时刻</th>';
        html += '<th style="padding:10px; text-align:left;">班期</th>';
        html += '<th style="padding:10px; text-align:left;">产品</th>';
        html += '</tr></thead>';
        html += '<tbody>';
 
        flights.forEach((f, index) => {
            const bgColor = index % 2 === 0 ? '#f9f9f9' : '#fff';
            html += `<tr style="background:${bgColor}; border-bottom:1px solid #ddd;">
                <td style="padding:10px;">${f.flightNo}</td>
                <td style="padding:10px;"><strong>${f.departure}</strong></td>
                <td style="padding:10px;"><strong>${f.arrival}</strong></td>
                <td style="padding:10px;">${f.departureTime}</td>
                <td style="padding:10px;">${f.schedule}</td>
                <td style="padding:10px;">${f.product}</td>
            </tr>`;
        });
 
        html += '</tbody></table></div>';
        return html;
    }
    // 版本比较函数
    function compareVersion(v1, v2) {
        const parts1 = v1.split('.').map(Number);
        const parts2 = v2.split('.').map(Number);
 
        for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
            const p1 = parts1[i] || 0;
            const p2 = parts2[i] || 0;
            if (p1 > p2) return 1;
            if (p1 < p2) return -1;
        }
        return 0;
    }
    // 检查更新
    async function checkForUpdates() {
        try {
            const lastCheck = localStorage.getItem('hnair_last_update_check');
            const now = Date.now();
 
            // 避免频繁检查
            if (lastCheck && (now - parseInt(lastCheck)) < UPDATE_CONFIG.checkInterval) {
                return;
            }
 
            const response = await fetch('https://update.itrip.cc/hna-plus/script-info.json?t=' + now);
            const data = await response.json();
 
            localStorage.setItem('hnair_last_update_check', now.toString());
 
            if (compareVersion(data.version, UPDATE_CONFIG.currentVersion) > 0) {
                showUpdateNotification(data);
            }
 
            // 显示公告（如果有）
            if (data.announcement && data.announcement.show) {
                showAnnouncement(data.announcement);
            }
        } catch (error) {
            console.error('更新检查失败:', error);
        }
    }
    // 显示更新通知
    function showUpdateNotification(updateInfo) {
        const isCritical = updateInfo.critical || false;
        const notification = document.createElement('div');
        notification.id = 'update-notification';
        notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 350px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        animation: slideInRight 0.5s ease-out;
    `;
 
        notification.innerHTML = `
        <style>
            @keyframes slideInRight {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .update-close-btn:hover { background: rgba(255,255,255,0.3) !important; }
        </style>
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
            <div>
                <div style="font-size: 20px; font-weight: bold; margin-bottom: 5px;">
                    🎉 发现新版本
                </div>
                <div style="font-size: 14px; opacity: 0.9;">
                    v${UPDATE_CONFIG.currentVersion} → v${updateInfo.version}
                </div>
            </div>
            ${!isCritical ? `
                <button class="update-close-btn" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: 18px; transition: all 0.3s;">
                    ×
                </button>
            ` : ''}
        </div>
        
        <div style="background: rgba(255,255,255,0.15); padding: 12px; border-radius: 8px; margin-bottom: 15px; font-size: 13px; line-height: 1.6;">
            <strong>✨ 更新内容：</strong><br>
            ${updateInfo.changelog.map(item => `• ${item}`).join('<br>')}
        </div>
 
         ${isCritical ? `
            <div style="background: rgba(255,71,87,0.3); padding: 10px; border-radius: 6px; margin-bottom: 15px; font-size: 12px;">
                ⚠️ 这是一个重要更新，强烈建议立即安装
            </div>
        ` : ''}
        
       <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <a href="${updateInfo.downloadUrl}" target="_blank" class="update-btn" style="flex: 1; min-width: 100px; background: white; color: #667eea; text-align: center; padding: 12px; border-radius: 6px; text-decoration: none; font-weight: bold; transition: all 0.3s;">
                ${isCritical ? '⚡ 立即更新' : '📥 立即更新'}
            </a>
            ${!isCritical ? `
                <button id="remind-later-btn" class="update-btn" style="flex: 1; min-width: 100px; background: rgba(255,255,255,0.2); color: white; border: none; padding: 12px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: all 0.3s;">
                    ⏰ 稍后提醒
                </button>
            ` : ''}
        </div>
        
        ${updateInfo.minVersion ? `
            <div style="margin-top: 10px; font-size: 11px; opacity: 0.7; text-align: center;">
                最低兼容版本: v${updateInfo.minVersion}
            </div>
        ` : ''}
    `;
 
        document.body.appendChild(notification);
 
                // 关闭按钮（添加空值检查）
        const closeBtn = notification.querySelector('.update-close-btn');
        if (closeBtn) {
            closeBtn.onclick = () => {
                const intervalId = notification.dataset.intervalId;
                if (intervalId) clearInterval(parseInt(intervalId));
                notification.remove();
            };
        }
 
        // 稍后提醒（3天后再检查）（添加空值检查）
        const remindLaterBtn = document.getElementById('remind-later-btn');
        if (remindLaterBtn) {
            remindLaterBtn.onclick = () => {
                localStorage.setItem('hnair_last_update_check', (Date.now() + 3 * 24 * 60 * 60 * 1000).toString());
                const intervalId = notification.dataset.intervalId;
                if (intervalId) clearInterval(parseInt(intervalId));
                notification.remove();
            };
        }
 
                // 如果是重要更新，10秒后自动跳转
        if (isCritical) {
            let countdown = 10;
            const countdownInterval = setInterval(() => {
                const updateBtn = notification.querySelector('a.update-btn');
                if (updateBtn) {
                    updateBtn.textContent = `⚡ 立即更新 (${countdown}s)`;
                }
                countdown--;
 
                if (countdown < 0) {
                    clearInterval(countdownInterval);
                    window.open(updateInfo.downloadUrl, '_blank');
                }
            }, 1000);
            
            // 保存定时器引用以便清理
            notification.dataset.intervalId = countdownInterval;
        }
    }
    // 显示公告/广告
    function showAnnouncement(announcement) {
        // 检查是否已关闭过此公告
        const dismissedAnnouncements = JSON.parse(localStorage.getItem('hnair_dismissed_announcements') || '[]');
        if (dismissedAnnouncements.includes(announcement.id)) {
            return;
        }
 
        const announcementDiv = document.createElement('div');
        announcementDiv.id = 'hnair-announcement';
        announcementDiv.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 320px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        overflow: hidden;
        z-index: 9999;
        animation: slideInUp 0.5s ease-out;
    `;
 
        announcementDiv.innerHTML = `
        <style>
            @keyframes slideInUp {
                from { transform: translateY(400px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            .announcement-link:hover { background: #0056b3 !important; }
        </style>
        
        ${announcement.imageUrl ? `
            <div style="position: relative; height: 160px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); overflow: hidden;">
                <img src="${announcement.imageUrl}" style="width: 100%; height: 100%; object-fit: cover;" />
                <button id="close-announcement" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.5); border: none; color: white; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 16px;">×</button>
            </div>
        ` : ''}
        
        <div style="padding: 20px;">
            <div style="font-size: 18px; font-weight: bold; color: #333; margin-bottom: 10px;">
                ${announcement.icon || '📢'} ${announcement.title}
            </div>
            <div style="font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 15px;">
                ${announcement.content}
            </div>
            
            ${announcement.actionUrl ? `
                <a href="${announcement.actionUrl}" target="_blank" class="announcement-link" style="display: block; background: #0066cc; color: white; text-align: center; padding: 12px; border-radius: 6px; text-decoration: none; font-weight: bold; transition: all 0.3s;">
                    ${announcement.actionText || '了解更多'}
                </a>
            ` : ''}
            
            ${!announcement.imageUrl ? `
                <button id="close-announcement" style="width: 100%; margin-top: 10px; background: #f5f5f5; border: none; color: #666; padding: 10px; border-radius: 6px; cursor: pointer; font-size: 13px;">
                    我知道了
                </button>
            ` : ''}
        </div>
    `;
 
        document.body.appendChild(announcementDiv);
 
        // 关闭公告
        document.getElementById('close-announcement').onclick = () => {
            dismissedAnnouncements.push(announcement.id);
            localStorage.setItem('hnair_dismissed_announcements', JSON.stringify(dismissedAnnouncements));
            announcementDiv.remove();
        };
    }
    // 完整的反馈按钮实现（方案1 + 方案4 组合）
    function createFeedbackButton() {
        const feedbackBtn = document.createElement('button');
        feedbackBtn.id = 'hnair-feedback-btn';
        feedbackBtn.innerHTML = '💬';
        feedbackBtn.title = '反馈问题 / 提出建议';
        feedbackBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 56px;
        height: 56px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 24px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        z-index: 9998;
        transition: all 0.3s ease;
    `;
        feedbackBtn.onclick = () => {
            // 收集环境信息
            const envInfo = {
                version: UPDATE_CONFIG.currentVersion,
                userAgent: navigator.userAgent,
                url: window.location.href,
                timestamp: new Date().toLocaleString('zh-CN'),
                viewport: `${window.innerWidth}x${window.innerHeight}`
            };
            // 构建 Issue 内容
            const issueBody = encodeURIComponent(`
## 📝 问题描述
<!-- 请详细描述你遇到的问题或建议 -->
## 🔧 环境信息
- **脚本版本**: \`${envInfo.version}\`
- **浏览器**: \`${envInfo.userAgent}\`
- **页面URL**: ${envInfo.url}
- **窗口大小**: ${envInfo.viewport}
- **反馈时间**: ${envInfo.timestamp}
## 🔄 复现步骤
1. 
2. 
3. 
## ✅ 期望行为
## ❌ 实际行为
## 📸 截图（可选）
<!-- 可以拖拽图片到这里 -->
        `.trim());
            const url = `https://github.com/CreatorEdition/hna-plus/issues/new?body=${issueBody}`;
            window.open(url, '_blank');
            // 记录反馈次数（用于统计）
            const feedbackCount = parseInt(localStorage.getItem('hnair_feedback_count') || '0') + 1;
            localStorage.setItem('hnair_feedback_count', feedbackCount.toString());
            console.log('📊 反馈次数:', feedbackCount);
        };
        // 悬停效果
        feedbackBtn.onmouseover = () => {
            feedbackBtn.style.transform = 'scale(1.1) rotate(15deg)';
            feedbackBtn.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
        };
        feedbackBtn.onmouseout = () => {
            feedbackBtn.style.transform = 'scale(1) rotate(0deg)';
            feedbackBtn.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
        };
        document.body.appendChild(feedbackBtn);
        // 首次使用提示（只显示一次）
        const hasSeenFeedbackTip = localStorage.getItem('hnair_feedback_tip_shown');
        if (!hasSeenFeedbackTip) {
            setTimeout(() => {
                showFeedbackTip(feedbackBtn);
                localStorage.setItem('hnair_feedback_tip_shown', 'true');
            }, 3000); // 3秒后显示提示
        }
    }
    // 显示反馈按钮提示
    function showFeedbackTip(feedbackBtn) {
        const tip = document.createElement('div');
        tip.id = 'feedback-tip';
        tip.style.cssText = `
        position: fixed;
        bottom: 95px;
        right: 30px;
        background: white;
        color: #333;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9997;
        font-size: 14px;
        max-width: 200px;
        animation: tipFadeIn 0.3s ease-out;
    `;
        tip.innerHTML = `
        <style>
            @keyframes tipFadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes tipFadeOut {
                from { opacity: 1; transform: translateY(0); }
                to { opacity: 0; transform: translateY(10px); }
            }
        </style>
        <div style="margin-bottom: 8px; font-weight: bold; color: #667eea;">
            💡 发现问题或有建议？
        </div>
        <div style="font-size: 13px; color: #666; line-height: 1.5;">
            点击这里向开发者反馈
        </div>
        <button id="close-tip-btn" style="
            margin-top: 8px;
            width: 100%;
            padding: 6px;
            background: #f5f5f5;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            color: #666;
        ">知道了</button>
    `;
        document.body.appendChild(tip);
        // 添加小三角（指向按钮）
        const arrow = document.createElement('div');
        arrow.style.cssText = `
        position: fixed;
        bottom: 85px;
        right: 53px;
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-top: 8px solid white;
        z-index: 9997;
    `;
        document.body.appendChild(arrow);
        // 关闭提示
        const closeTip = () => {
            tip.style.animation = 'tipFadeOut 0.3s ease-out';
            arrow.style.animation = 'tipFadeOut 0.3s ease-out';
            setTimeout(() => {
                tip.remove();
                arrow.remove();
            }, 300);
        };
        document.getElementById('close-tip-btn').onclick = closeTip;
        // 点击反馈按钮也关闭提示
        feedbackBtn.addEventListener('click', closeTip, { once: true });
        // 5秒后自动消失
        setTimeout(closeTip, 5000);
    }
 
    // 初始化
    function init() {
        // 等待页面加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }
 
        const flights = parseFlightData();
        console.log(`✅ 成功解析 ${flights.length} 条航班数据`);
 
        if (flights.length > 0) {
            checkForUpdates();           // 检查更新
            createSearchUI(flights);     // 创建搜索界面
            createFeedbackButton();      // 创建反馈按钮
            console.log('✅ 搜索界面已加载');
        } else {
            console.error('❌ 未能解析到航班数据');
        }
    }
 
    init();
})();