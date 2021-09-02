import aiohttp
import asyncio
import uvicorn
from fastai import *
from fastai.vision import *
from io import BytesIO
from starlette.applications import Starlette
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import HTMLResponse, JSONResponse
from starlette.staticfiles import StaticFiles

export_file_url = 'https://drive.google.com/uc?export=download&id=1qGyr9AEj71iLITNpjBaKqY7DYJ2xrVfm'
export_file_name = 'export_resnet34_model.pkl'
export_file_path = Path(__file__).parent / 'models'

classes = ['Apple_scab','Black_rot','Cedar_apple_rust','Apple_healthy','Blueberry_healthy','Cherry_(including_sour)_Powdery_mildew','Cherry_(including_sour)_healthy','Corn_(maize)_Cercospora_leaf_spot Gray_leaf_spot','Corn_(maize)_Common_rust_','Corn_(maize)_Northern_Leaf_Blight','Corn_(maize)_healthy','Grape_Black_rot','Grape_Esca_(Black_Measles)','Grape_Leaf_blight_(Isariopsis_Leaf_Spot)','Grape_healthy','Orange_Haunglongbing_(Citrus_greening)','Peach_Bacterial_spot','Peach_healthy','Pepper,_bell_Bacterial_spot','Pepper,_bell_healthy','Potato_Early_blight','Potato_Late_blight','Potato_healthy','Raspberry_healthy','Soybean_healthy','Squash_Powdery_mildew','Strawberry_Leaf_scorch','Strawberry_healthy','Tomato_Bacterial_spot','Tomato_Early_blight','Tomato_Late_blight','Tomato_Leaf_Mold','Tomato_Septoria_leaf_spot','Tomato_Spider_mites Two-spotted_spider_mite','Tomato_Target_Spot','Tomato_Yellow_Leaf_Curl_Virus','Tomato_mosaic_virus','Tomato_healthy','background']

app = Starlette()
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_headers=['X-Requested-With', 'Content-Type'])
app.mount('/static', StaticFiles(directory='app/static'))


async def download_file(url, dest):
    if dest.exists():
        return
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            data = await response.read()
            with open(dest, 'wb') as f:
                f.write(data)


async def setup_learner():
    await download_file(export_file_url, export_file_path / export_file_name)
    try:
        learn = load_learner(export_file_path, export_file_name)
        return learn
    except RuntimeError as e:
        if len(e.args) > 0 and 'CPU-only machine' in e.args[0]:
            print(e)
            message = "\n\nThis model was trained with an old version of fastai and will not work in a CPU environment.\n\nPlease update the fastai library in your training environment and export your model again.\n\nSee instructions for 'Returning to work' at https://course.fast.ai."
            raise RuntimeError(message)
        else:
            raise


loop = asyncio.get_event_loop()
tasks = [asyncio.ensure_future(setup_learner())]
learn = loop.run_until_complete(asyncio.gather(*tasks))[0]
loop.close()

index_path = Path(__file__).parent

@app.route('/')
async def homepage(request):
    index_file = index_path / 'view' / 'index.html'
    return HTMLResponse(index_file.open().read())


@app.route('/analyze', methods=['POST'])
async def analyze(request):
    img_data = await request.form()
    img_bytes = await (img_data['file'].read())
    img = open_image(BytesIO(img_bytes))
    prediction = learn.predict(img)[0]
    return JSONResponse({'result': str(prediction)})


if __name__ == '__main__':
    if 'serve' in sys.argv:
        uvicorn.run(app=app, host='0.0.0.0', port=8080, log_level="info")
