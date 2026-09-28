import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            record_video_dir="/home/jules/verification/videos/",
            record_video_size={"width": 1280, "height": 720}
        )
        page = await context.new_page()

        # Navigate to the local server
        await page.goto("http://localhost:5173/login")

        # Wait for the UI to settle
        await page.wait_for_timeout(2000)

        # Take a screenshot
        await page.screenshot(path="/home/jules/verification/screenshots/login.png")

        # Focus on an element
        try:
           await page.focus("button")
           await page.keyboard.press("Tab")
        except:
           pass

        await page.wait_for_timeout(1000)

        await context.close()
        await browser.close()

asyncio.run(main())
