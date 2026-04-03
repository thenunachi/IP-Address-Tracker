from models import db

plant_regions = db.Table('plant_regions',
    db.Column('plant_id', db.Integer, db.ForeignKey('plants.id'), primary_key=True),
    db.Column('region_id', db.Integer, db.ForeignKey('regions.id'), primary_key=True)
)

class Region(db.Model):
    __tablename__ = 'regions'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text)
    climate = db.Column(db.String(100))
    avg_temp_min = db.Column(db.Float)
    avg_temp_max = db.Column(db.Float)
    plants = db.relationship('Plant', secondary=plant_regions, back_populates='regions')

    def to_dict(self, include_plants=False):
        data = {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'climate': self.climate,
            'avg_temp_min': self.avg_temp_min,
            'avg_temp_max': self.avg_temp_max,
        }
        if include_plants:
            data['plants'] = [p.to_dict() for p in self.plants]
        return data

class Plant(db.Model):
    __tablename__ = 'plants'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    scientific_name = db.Column(db.String(150))
    category = db.Column(db.String(50))  # vegetable, fruit, grain, herb, flower
    description = db.Column(db.Text)
    germination_weeks_min = db.Column(db.Integer)
    germination_weeks_max = db.Column(db.Integer)
    fruit_bearing_weeks_min = db.Column(db.Integer)
    fruit_bearing_weeks_max = db.Column(db.Integer)
    temp_min = db.Column(db.Float)
    temp_max = db.Column(db.Float)
    temp_optimal = db.Column(db.Float)
    sunlight = db.Column(db.String(50))  # full sun, partial shade, shade
    water_needs = db.Column(db.String(50))  # low, moderate, high
    soil_type = db.Column(db.String(100))
    difficulty = db.Column(db.String(20))  # easy, medium, hard
    emoji = db.Column(db.String(10))
    regions = db.relationship('Region', secondary=plant_regions, back_populates='plants')

    def to_dict(self, include_regions=False):
        data = {
            'id': self.id,
            'name': self.name,
            'scientific_name': self.scientific_name,
            'category': self.category,
            'description': self.description,
            'germination_weeks_min': self.germination_weeks_min,
            'germination_weeks_max': self.germination_weeks_max,
            'fruit_bearing_weeks_min': self.fruit_bearing_weeks_min,
            'fruit_bearing_weeks_max': self.fruit_bearing_weeks_max,
            'temp_min': self.temp_min,
            'temp_max': self.temp_max,
            'temp_optimal': self.temp_optimal,
            'sunlight': self.sunlight,
            'water_needs': self.water_needs,
            'soil_type': self.soil_type,
            'difficulty': self.difficulty,
            'emoji': self.emoji,
            'regions': [r.to_dict() for r in self.regions],
        }
        return data
