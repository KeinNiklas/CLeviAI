from mangum import Mangum
from main import app

# Vercel/AWS Lambda handler
handler = Mangum(app)
