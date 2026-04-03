import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app import create_app
from models import db
from models.plant import Plant, Region

def seed():
    app = create_app()
    with app.app_context():
        db.drop_all()
        db.create_all()

        # ── Regions ──────────────────────────────────────────────
        tropical = Region(
            name="Tropical",
            description="Hot and humid year-round near the equator. High rainfall and biodiversity.",
            climate="Tropical Rainforest / Monsoon",
            avg_temp_min=20, avg_temp_max=35
        )
        subtropical = Region(
            name="Subtropical",
            description="Warm temperatures with distinct wet and dry seasons.",
            climate="Humid/Dry Subtropical",
            avg_temp_min=15, avg_temp_max=30
        )
        temperate = Region(
            name="Temperate",
            description="Four distinct seasons with moderate rainfall throughout the year.",
            climate="Oceanic / Continental Temperate",
            avg_temp_min=5, avg_temp_max=25
        )
        mediterranean = Region(
            name="Mediterranean",
            description="Hot dry summers and mild wet winters. Coastal climates.",
            climate="Mediterranean",
            avg_temp_min=8, avg_temp_max=28
        )
        arid = Region(
            name="Arid / Desert",
            description="Very low rainfall, extreme heat by day and cold by night.",
            climate="Hot Desert / Semi-Arid",
            avg_temp_min=10, avg_temp_max=45
        )
        alpine = Region(
            name="Alpine / Arctic",
            description="Very cold temperatures, short growing seasons, frost possible year-round.",
            climate="Alpine / Tundra",
            avg_temp_min=-10, avg_temp_max=15
        )

        db.session.add_all([tropical, subtropical, temperate, mediterranean, arid, alpine])
        db.session.commit()

        # ── Plants ───────────────────────────────────────────────
        plants_data = [
            Plant(
                name="Tomato", scientific_name="Solanum lycopersicum", category="vegetable",
                description="One of the most popular garden vegetables. Thrives in warm climates with full sun. Produces juicy red fruits packed with vitamins.",
                germination_weeks_min=1, germination_weeks_max=2,
                fruit_bearing_weeks_min=8, fruit_bearing_weeks_max=12,
                temp_min=10, temp_max=35, temp_optimal=24,
                sunlight="Full Sun", water_needs="Moderate", soil_type="Well-draining loamy soil",
                difficulty="easy", emoji="🍅",
                regions=[temperate, subtropical]
            ),
            Plant(
                name="Mango", scientific_name="Mangifera indica", category="fruit",
                description="King of fruits. A tropical tree that produces sweet aromatic fruits. Requires a dry season to trigger flowering.",
                germination_weeks_min=2, germination_weeks_max=4,
                fruit_bearing_weeks_min=260, fruit_bearing_weeks_max=520,
                temp_min=21, temp_max=43, temp_optimal=30,
                sunlight="Full Sun", water_needs="Moderate", soil_type="Deep well-drained loamy soil",
                difficulty="medium", emoji="🥭",
                regions=[tropical, subtropical]
            ),
            Plant(
                name="Wheat", scientific_name="Triticum aestivum", category="grain",
                description="A staple cereal crop grown worldwide. Cool-season crop that tolerates frost during vegetative stage.",
                germination_weeks_min=1, germination_weeks_max=2,
                fruit_bearing_weeks_min=16, fruit_bearing_weeks_max=24,
                temp_min=3, temp_max=32, temp_optimal=15,
                sunlight="Full Sun", water_needs="Low", soil_type="Clay loam to loamy soil",
                difficulty="medium", emoji="🌾",
                regions=[temperate, alpine]
            ),
            Plant(
                name="Rice", scientific_name="Oryza sativa", category="grain",
                description="The world's most important food crop. Requires flooded paddies for best yields. Demands high heat and humidity.",
                germination_weeks_min=1, germination_weeks_max=2,
                fruit_bearing_weeks_min=14, fruit_bearing_weeks_max=20,
                temp_min=20, temp_max=40, temp_optimal=30,
                sunlight="Full Sun", water_needs="High", soil_type="Clayey waterlogged soil",
                difficulty="hard", emoji="🍚",
                regions=[tropical, subtropical]
            ),
            Plant(
                name="Apple", scientific_name="Malus domestica", category="fruit",
                description="A beloved temperate-zone fruit tree that needs cold winters (chilling hours) to break dormancy and produce fruit.",
                germination_weeks_min=10, germination_weeks_max=16,
                fruit_bearing_weeks_min=200, fruit_bearing_weeks_max=400,
                temp_min=-15, temp_max=35, temp_optimal=18,
                sunlight="Full Sun", water_needs="Moderate", soil_type="Well-drained loamy soil",
                difficulty="medium", emoji="🍎",
                regions=[temperate]
            ),
            Plant(
                name="Banana", scientific_name="Musa acuminata", category="fruit",
                description="A fast-growing tropical plant that produces clusters of nutritious fruits. Loves heat, humidity, and rich soil.",
                germination_weeks_min=3, germination_weeks_max=6,
                fruit_bearing_weeks_min=36, fruit_bearing_weeks_max=52,
                temp_min=18, temp_max=38, temp_optimal=27,
                sunlight="Full Sun", water_needs="High", soil_type="Rich loamy well-drained soil",
                difficulty="easy", emoji="🍌",
                regions=[tropical, subtropical]
            ),
            Plant(
                name="Cactus (Saguaro)", scientific_name="Carnegiea gigantea", category="succulent",
                description="An iconic desert plant that stores water in its trunk. Extremely drought-tolerant and slow-growing.",
                germination_weeks_min=2, germination_weeks_max=8,
                fruit_bearing_weeks_min=2080, fruit_bearing_weeks_max=3120,
                temp_min=-9, temp_max=50, temp_optimal=32,
                sunlight="Full Sun", water_needs="Low", soil_type="Sandy or gravelly well-drained soil",
                difficulty="easy", emoji="🌵",
                regions=[arid]
            ),
            Plant(
                name="Potato", scientific_name="Solanum tuberosum", category="vegetable",
                description="A cool-season root crop and global food staple. Grows best in loose, well-drained soil with cool temperatures.",
                germination_weeks_min=2, germination_weeks_max=4,
                fruit_bearing_weeks_min=10, fruit_bearing_weeks_max=16,
                temp_min=7, temp_max=25, temp_optimal=16,
                sunlight="Full Sun", water_needs="Moderate", soil_type="Loose sandy loam soil",
                difficulty="easy", emoji="🥔",
                regions=[temperate, alpine]
            ),
            Plant(
                name="Lavender", scientific_name="Lavandula angustifolia", category="herb",
                description="A fragrant Mediterranean herb used in perfumes and cooking. Thrives in dry, sunny conditions with poor soil.",
                germination_weeks_min=2, germination_weeks_max=4,
                fruit_bearing_weeks_min=12, fruit_bearing_weeks_max=20,
                temp_min=-15, temp_max=35, temp_optimal=20,
                sunlight="Full Sun", water_needs="Low", soil_type="Sandy well-drained alkaline soil",
                difficulty="easy", emoji="💜",
                regions=[mediterranean, temperate]
            ),
            Plant(
                name="Olive", scientific_name="Olea europaea", category="fruit",
                description="An ancient Mediterranean tree known for its oil-rich fruits. Extremely drought-tolerant once established.",
                germination_weeks_min=8, germination_weeks_max=12,
                fruit_bearing_weeks_min=260, fruit_bearing_weeks_max=520,
                temp_min=-10, temp_max=40, temp_optimal=22,
                sunlight="Full Sun", water_needs="Low", soil_type="Well-drained calcareous loamy soil",
                difficulty="medium", emoji="🫒",
                regions=[mediterranean, arid]
            ),
            Plant(
                name="Coconut", scientific_name="Cocos nucifera", category="fruit",
                description="The 'tree of life' in tropical cultures. Provides food, water, oil, and fiber. Needs year-round warmth.",
                germination_weeks_min=12, germination_weeks_max=24,
                fruit_bearing_weeks_min=300, fruit_bearing_weeks_max=400,
                temp_min=20, temp_max=38, temp_optimal=27,
                sunlight="Full Sun", water_needs="High", soil_type="Sandy coastal soil",
                difficulty="medium", emoji="🥥",
                regions=[tropical]
            ),
            Plant(
                name="Strawberry", scientific_name="Fragaria × ananassa", category="fruit",
                description="A popular low-growing fruit plant. Produces sweet red berries. Needs cold winters for dormancy.",
                germination_weeks_min=2, germination_weeks_max=4,
                fruit_bearing_weeks_min=12, fruit_bearing_weeks_max=16,
                temp_min=1, temp_max=30, temp_optimal=20,
                sunlight="Full Sun", water_needs="Moderate", soil_type="Well-drained sandy loam soil",
                difficulty="easy", emoji="🍓",
                regions=[temperate, alpine]
            ),
            Plant(
                name="Chili Pepper", scientific_name="Capsicum annuum", category="vegetable",
                description="A spicy crop grown worldwide. Requires warm temperatures to develop heat compounds (capsaicin).",
                germination_weeks_min=2, germination_weeks_max=3,
                fruit_bearing_weeks_min=8, fruit_bearing_weeks_max=14,
                temp_min=15, temp_max=38, temp_optimal=27,
                sunlight="Full Sun", water_needs="Moderate", soil_type="Rich well-drained loamy soil",
                difficulty="easy", emoji="🌶️",
                regions=[tropical, subtropical]
            ),
            Plant(
                name="Blueberry", scientific_name="Vaccinium corymbosum", category="fruit",
                description="A nutritious cold-hardy berry shrub. Requires acidic soil and cold winters. Excellent antioxidant content.",
                germination_weeks_min=4, germination_weeks_max=8,
                fruit_bearing_weeks_min=100, fruit_bearing_weeks_max=200,
                temp_min=-20, temp_max=30, temp_optimal=18,
                sunlight="Full Sun", water_needs="Moderate", soil_type="Acidic well-drained sandy soil",
                difficulty="hard", emoji="🫐",
                regions=[temperate, alpine]
            ),
            Plant(
                name="Sunflower", scientific_name="Helianthus annuus", category="flower",
                description="A tall, sun-loving flowering plant that produces edible seeds. Very adaptable and fast-growing.",
                germination_weeks_min=1, germination_weeks_max=2,
                fruit_bearing_weeks_min=8, fruit_bearing_weeks_max=12,
                temp_min=7, temp_max=35, temp_optimal=22,
                sunlight="Full Sun", water_needs="Moderate", soil_type="Well-drained loamy soil",
                difficulty="easy", emoji="🌻",
                regions=[temperate, subtropical, mediterranean]
            ),
            Plant(
                name="Basil", scientific_name="Ocimum basilicum", category="herb",
                description="A fragrant culinary herb used in Mediterranean and Asian cuisines. Sensitive to cold; thrives in heat.",
                germination_weeks_min=1, germination_weeks_max=2,
                fruit_bearing_weeks_min=6, fruit_bearing_weeks_max=10,
                temp_min=10, temp_max=35, temp_optimal=25,
                sunlight="Full Sun", water_needs="Moderate", soil_type="Moist well-drained rich soil",
                difficulty="easy", emoji="🌿",
                regions=[tropical, subtropical, mediterranean]
            ),
            Plant(
                name="Pumpkin", scientific_name="Cucurbita pepo", category="vegetable",
                description="A warm-season vine crop producing large fruits. Needs ample space, sun, and consistent moisture.",
                germination_weeks_min=1, germination_weeks_max=2,
                fruit_bearing_weeks_min=12, fruit_bearing_weeks_max=16,
                temp_min=10, temp_max=35, temp_optimal=25,
                sunlight="Full Sun", water_needs="High", soil_type="Rich fertile well-drained soil",
                difficulty="easy", emoji="🎃",
                regions=[temperate, subtropical]
            ),
            Plant(
                name="Date Palm", scientific_name="Phoenix dactylifera", category="fruit",
                description="An ancient desert fruit tree adapted to extreme heat and drought. Produces sweet nutritious dates.",
                germination_weeks_min=4, germination_weeks_max=8,
                fruit_bearing_weeks_min=260, fruit_bearing_weeks_max=364,
                temp_min=5, temp_max=50, temp_optimal=35,
                sunlight="Full Sun", water_needs="Low", soil_type="Sandy well-drained soil",
                difficulty="hard", emoji="🌴",
                regions=[arid, subtropical]
            ),
            Plant(
                name="Kale", scientific_name="Brassica oleracea var. sabellica", category="vegetable",
                description="A cold-hardy superfood vegetable. Flavor actually improves after frost. Packed with vitamins and minerals.",
                germination_weeks_min=1, germination_weeks_max=2,
                fruit_bearing_weeks_min=8, fruit_bearing_weeks_max=10,
                temp_min=-10, temp_max=25, temp_optimal=15,
                sunlight="Full Sun", water_needs="Moderate", soil_type="Fertile well-drained moist soil",
                difficulty="easy", emoji="🥬",
                regions=[temperate, alpine]
            ),
            Plant(
                name="Lemon", scientific_name="Citrus limon", category="fruit",
                description="A popular citrus tree producing tart, vitamin C-rich fruits. Frost-sensitive but very adaptable to pots.",
                germination_weeks_min=4, germination_weeks_max=8,
                fruit_bearing_weeks_min=200, fruit_bearing_weeks_max=300,
                temp_min=7, temp_max=38, temp_optimal=25,
                sunlight="Full Sun", water_needs="Moderate", soil_type="Well-drained sandy loam",
                difficulty="medium", emoji="🍋",
                regions=[subtropical, mediterranean]
            ),
        ]

        db.session.add_all(plants_data)
        db.session.commit()
        print(f"Seeded {len(plants_data)} plants and 6 regions successfully!")

if __name__ == '__main__':
    seed()
