from mangum import Mangum
from main import app

# Vercel/AWS Lambda handler with custom configuration for file uploads
handler = Mangum(app, lifespan="off", api_gateway_base_path="/")
