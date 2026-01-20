// 전역 변수
let currentFilter = 'all';

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    loadRules();
    setupEventListeners();
});

// 이벤트 리스너 설정
function setupEventListeners() {
    // 규칙 추가 폼
    document.getElementById('ruleForm').addEventListener('submit', handleAddRule);
    
    // 규칙 수정 폼
    document.getElementById('editForm').addEventListener('submit', handleEditRule);
    
    // 필터 버튼들
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.category;
            loadRules();
        });
    });
    
    // 모달 닫기
    document.querySelector('.close').addEventListener('click', closeModal);
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('editModal');
        if (event.target === modal) {
            closeModal();
        }
    });
}

// 규칙 목록 로드
async function loadRules() {
    try {
        const url = currentFilter === 'all' 
            ? '/api/rules' 
            : `/api/rules?category=${encodeURIComponent(currentFilter)}`;
        
        const response = await fetch(url);
        const rules = await response.json();
        
        displayRules(rules);
    } catch (error) {
        console.error('규칙 로드 실패:', error);
        alert('규칙을 불러오는데 실패했습니다.');
    }
}

// 규칙 표시
function displayRules(rules) {
    const rulesList = document.getElementById('rulesList');
    
    if (rules.length === 0) {
        rulesList.innerHTML = `
            <div class="empty-state">
                <h3>📋 등록된 규칙이 없습니다</h3>
                <p>새로운 규칙을 추가해보세요!</p>
            </div>
        `;
        return;
    }
    
    rulesList.innerHTML = rules.map(rule => `
        <div class="rule-card priority-${rule.priority}">
            <div class="rule-header">
                <div class="rule-title">${escapeHtml(rule.title)}</div>
                <div class="rule-meta">
                    <span class="rule-category">${getCategoryIcon(rule.category)} ${escapeHtml(rule.category)}</span>
                    <span class="rule-priority ${rule.priority}">${rule.priority}</span>
                </div>
            </div>
            <div class="rule-description">${escapeHtml(rule.description)}</div>
            <div class="rule-footer">
                <div class="rule-date">📅 ${rule.created_at}</div>
                <div class="rule-actions">
                    <button class="btn-edit" onclick="openEditModal(${rule.id})">수정</button>
                    <button class="btn-delete" onclick="deleteRule(${rule.id})">삭제</button>
                </div>
            </div>
        </div>
    `).join('');
}

// 규칙 추가
async function handleAddRule(e) {
    e.preventDefault();
    
    const formData = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        category: document.getElementById('category').value,
        priority: document.getElementById('priority').value
    };
    
    try {
        const response = await fetch('/api/rules', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            document.getElementById('ruleForm').reset();
            loadRules();
            showNotification('규칙이 추가되었습니다! ✅');
        } else {
            throw new Error('규칙 추가 실패');
        }
    } catch (error) {
        console.error('규칙 추가 실패:', error);
        alert('규칙 추가에 실패했습니다.');
    }
}

// 수정 모달 열기
async function openEditModal(ruleId) {
    try {
        const response = await fetch(`/api/rules?category=all`);
        const rules = await response.json();
        const rule = rules.find(r => r.id === ruleId);
        
        if (rule) {
            document.getElementById('editId').value = rule.id;
            document.getElementById('editTitle').value = rule.title;
            document.getElementById('editDescription').value = rule.description;
            document.getElementById('editCategory').value = rule.category;
            document.getElementById('editPriority').value = rule.priority;
            
            document.getElementById('editModal').style.display = 'block';
        }
    } catch (error) {
        console.error('규칙 정보 로드 실패:', error);
        alert('규칙 정보를 불러오는데 실패했습니다.');
    }
}

// 모달 닫기
function closeModal() {
    document.getElementById('editModal').style.display = 'none';
}

// 규칙 수정
async function handleEditRule(e) {
    e.preventDefault();
    
    const ruleId = document.getElementById('editId').value;
    const formData = {
        title: document.getElementById('editTitle').value,
        description: document.getElementById('editDescription').value,
        category: document.getElementById('editCategory').value,
        priority: document.getElementById('editPriority').value
    };
    
    try {
        const response = await fetch(`/api/rules/${ruleId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            closeModal();
            loadRules();
            showNotification('규칙이 수정되었습니다! ✅');
        } else {
            throw new Error('규칙 수정 실패');
        }
    } catch (error) {
        console.error('규칙 수정 실패:', error);
        alert('규칙 수정에 실패했습니다.');
    }
}

// 규칙 삭제
async function deleteRule(ruleId) {
    if (!confirm('정말로 이 규칙을 삭제하시겠습니까?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/rules/${ruleId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadRules();
            showNotification('규칙이 삭제되었습니다! 🗑️');
        } else {
            throw new Error('규칙 삭제 실패');
        }
    } catch (error) {
        console.error('규칙 삭제 실패:', error);
        alert('규칙 삭제에 실패했습니다.');
    }
}

// 유틸리티 함수들
function getCategoryIcon(category) {
    const icons = {
        '청소': '🧹',
        '주방': '🍳',
        '소음': '🔇',
        '공용공간': '🛋️',
        '손님': '👥',
        '기타': '📝'
    };
    return icons[category] || '📝';
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function showNotification(message) {
    // 간단한 알림 표시 (추후 개선 가능)
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 2000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 애니메이션 스타일 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
