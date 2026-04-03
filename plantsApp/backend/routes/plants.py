from flask import Blueprint, jsonify, request
from models import db
from models.plant import Plant, Region

plants_bp = Blueprint('plants', __name__)

@plants_bp.route('/plants', methods=['GET'])
def get_plants():
    category = request.args.get('category')
    region = request.args.get('region')
    difficulty = request.args.get('difficulty')
    search = request.args.get('search')

    query = Plant.query

    if category:
        query = query.filter(Plant.category.ilike(f'%{category}%'))
    if difficulty:
        query = query.filter(Plant.difficulty.ilike(f'%{difficulty}%'))
    if region:
        query = query.join(Plant.regions).filter(Region.name.ilike(f'%{region}%'))
    if search:
        query = query.filter(Plant.name.ilike(f'%{search}%'))

    plants = query.all()
    return jsonify([p.to_dict() for p in plants])

@plants_bp.route('/plants/<int:plant_id>', methods=['GET'])
def get_plant(plant_id):
    plant = Plant.query.get_or_404(plant_id)
    return jsonify(plant.to_dict(include_regions=True))

@plants_bp.route('/regions', methods=['GET'])
def get_regions():
    regions = Region.query.all()
    return jsonify([r.to_dict(include_plants=True) for r in regions])

@plants_bp.route('/regions/<int:region_id>', methods=['GET'])
def get_region(region_id):
    region = Region.query.get_or_404(region_id)
    return jsonify(region.to_dict(include_plants=True))

@plants_bp.route('/categories', methods=['GET'])
def get_categories():
    categories = db.session.query(Plant.category).distinct().all()
    return jsonify([c[0] for c in categories if c[0]])

@plants_bp.route('/stats', methods=['GET'])
def get_stats():
    total_plants = Plant.query.count()
    total_regions = Region.query.count()
    categories = db.session.query(Plant.category, db.func.count(Plant.id)).group_by(Plant.category).all()
    return jsonify({
        'total_plants': total_plants,
        'total_regions': total_regions,
        'by_category': {c: count for c, count in categories}
    })
