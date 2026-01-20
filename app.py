from flask import Flask, render_template, request, jsonify, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)

# 데이터베이스 설정 - Vercel에서는 환경 변수 사용
database_url = os.environ.get('DATABASE_URL')
if database_url:
    # Vercel 배포 환경
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
else:
    # 로컬 개발 환경
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///sharehouse.db'
    
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# 규칙 모델
class Rule(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    priority = db.Column(db.String(20), default='보통')
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M'),
            'priority': self.priority
        }

# 데이터베이스 초기화
with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/rules', methods=['GET'])
def get_rules():
    category = request.args.get('category')
    if category and category != 'all':
        rules = Rule.query.filter_by(category=category).order_by(Rule.created_at.desc()).all()
    else:
        rules = Rule.query.order_by(Rule.created_at.desc()).all()
    return jsonify([rule.to_dict() for rule in rules])

@app.route('/api/rules', methods=['POST'])
def add_rule():
    data = request.json
    new_rule = Rule(
        title=data['title'],
        description=data['description'],
        category=data['category'],
        priority=data.get('priority', '보통')
    )
    db.session.add(new_rule)
    db.session.commit()
    return jsonify(new_rule.to_dict()), 201

@app.route('/api/rules/<int:rule_id>', methods=['PUT'])
def update_rule(rule_id):
    rule = Rule.query.get_or_404(rule_id)
    data = request.json
    rule.title = data['title']
    rule.description = data['description']
    rule.category = data['category']
    rule.priority = data.get('priority', '보통')
    db.session.commit()
    return jsonify(rule.to_dict())

@app.route('/api/rules/<int:rule_id>', methods=['DELETE'])
def delete_rule(rule_id):
    rule = Rule.query.get_or_404(rule_id)
    db.session.delete(rule)
    db.session.commit()
    return '', 204

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
