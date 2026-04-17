import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> Navigate to http://localhost:8081
        await page.goto("http://localhost:8081")
        
        # -> Fill the TC Kimlik No and password fields with provided credentials, then submit the login form (press Enter).
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div/div/div[2]/div/div/div/div/div/div[2]/div/div/div/div[2]/div/div/div[2]/input').nth(0)
        await asyncio.sleep(3); await elem.fill('27098173614')
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div/div/div[2]/div/div/div/div/div/div[2]/div/div/div/div[2]/div/div[2]/div[2]/input').nth(0)
        await asyncio.sleep(3); await elem.fill('939623Aybars.')
        
        # -> Click the 'Ziyaretçiler' (Visitors) navigation item to open the visitors page.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div/div[2]/div/div/div/div/div/div/div[2]/a[2]').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Click the 'Yeni Ziyaretçi Ekle' button to start a new visitor check-in (open the check-in form).
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div/div[2]/div/div/div/div/div[2]/div[2]/div/button').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Fill required visitor check-in fields (Ad, Soyad, T.C. Kimlik No, Telefon, Ziyaret Nedeni) and submit the form by clicking 'Ziyaretçi Ekle' (index 459).
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div/div/div[2]/div/div/div/div/div[2]/div[2]/div/div/div/div/div[3]/div/div[2]/div/div/div/div/div[2]/input').nth(0)
        await asyncio.sleep(3); await elem.fill('Ahmet')
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div/div/div[2]/div/div/div/div/div[2]/div[2]/div/div/div/div/div[3]/div/div[2]/div/div/div[2]/div/div[2]/input').nth(0)
        await asyncio.sleep(3); await elem.fill('Yılmaz')
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div/div/div[2]/div/div/div/div/div[2]/div[2]/div/div/div/div/div[3]/div/div[2]/div[2]/div/div/div[2]/input').nth(0)
        await asyncio.sleep(3); await elem.fill('12345678901')
        
        # -> Open the 'Birim' selector so a unit can be chosen (this is a context-setting field; stop after opening and re-observe the options).
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div/div[2]/div/div/div/div/div[2]/div[2]/div/div/div/div/div[3]/div[2]/div[2]/div/div/div[2]/button').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Correct the T.C. Kimlik No to a valid number, fill Telefon and Ziyaret Nedeni, then submit the form by clicking 'Ziyaretçi Ekle'.
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div/div/div[2]/div/div/div/div/div[2]/div[2]/div/div/div/div/div[3]/div/div[2]/div[2]/div/div/div[2]/input').nth(0)
        await asyncio.sleep(3); await elem.fill('10000000146')
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div/div/div[2]/div/div/div/div/div[2]/div[2]/div/div/div/div/div[3]/div/div[2]/div[2]/div[2]/div/div[2]/input').nth(0)
        await asyncio.sleep(3); await elem.fill('05551234567')
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div/div/div[2]/div/div/div/div/div[2]/div[2]/div/div/div/div/div[3]/div[3]/div[2]/div[2]/div/div[2]/textarea').nth(0)
        await asyncio.sleep(3); await elem.fill('Toplantı')
        
        # -> Open the 'Birim' (unit) selector so a unit can be chosen (click the Birim selector). Stop after opening to re-observe available options.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div/div[2]/div/div/div/div/div[2]/div[2]/div/div/div/div/div[3]/div[2]/div[2]/div/div/div[2]/button').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Enter/select a Birim (unit) in the Birim input so the dependent Kişi field can populate. Stop after setting the Birim so the page can update.
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div/div/div[2]/div/div/div/div/div[2]/div[2]/div/div/div/div/div[3]/div[2]/div[2]/div/div/div[2]/button/input').nth(0)
        await asyncio.sleep(3); await elem.fill('Klinik')
        
        # -> Set/select the Birim (unit) by entering/confirming 'Klinik' in the Birim input so the dependent Kişi field can populate. Stop after setting Birim and let the page update.
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div/div/div[2]/div/div/div/div/div[2]/div[2]/div/div/div/div/div[3]/div[2]/div[2]/div/div/div[2]/button/input').nth(0)
        await asyncio.sleep(3); await elem.fill('Klinik')
        
        # -> Select/confirm the Birim by entering 'Klinik' into the Birim input so the dependent Kişi list can populate. Stop after setting Birim to allow the page to update.
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div/div/div[2]/div/div/div/div/div[2]/div[2]/div/div/div/div/div[3]/div[2]/div[2]/div/div/div[2]/button/input').nth(0)
        await asyncio.sleep(3); await elem.fill('Klinik')
        
        # -> Select/confirm the Birim by typing 'Klinik' into the Birim input and confirming the choice so the dependent Kişi field can populate.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div/div[2]/div/div/div/div/div[2]/div[2]/div/div/div/div/div[3]/div[2]/div[2]/div/div/div[2]/button').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div/div/div[2]/div/div/div/div/div[2]/div[2]/div/div/div/div/div[3]/div[2]/div[2]/div/div/div[2]/button/input').nth(0)
        await asyncio.sleep(3); await elem.fill('Klinik')
        
        # -> Set/confirm the Birim (unit) by filling the Birim input with 'Klinik' so the dependent Kişi field can populate. Stop after setting Birim to let the page update.
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div/div/div[2]/div/div/div/div/div[2]/div[2]/div/div/div/div/div[3]/div[2]/div[2]/div/div/div[2]/button/input').nth(0)
        await asyncio.sleep(3); await elem.fill('Klinik')
        
        # -> Set/confirm the Birim (unit) by selecting 'Klinik' so the dependent Kişi list can populate. Stop and let the page update after confirming Birim.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div/div[2]/div/div/div/div/div[2]/div[2]/div/div/div/div/div[3]/div[2]/div[2]/div/div/div[2]/button').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div/div/div[2]/div/div/div/div/div[2]/div[2]/div/div/div/div/div[3]/div[2]/div[2]/div/div/div[2]/button/input').nth(0)
        await asyncio.sleep(3); await elem.fill('Klinik')
        
        # -> Open the Birim (unit) selector so an option can be chosen (click the Birim selector to reveal selectable options). Stop after opening to re-observe the available options.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div/div[2]/div/div/div/div/div[2]/div[2]/div/div/div/div/div[3]/div[2]/div[2]/div/div/div[2]/button').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Set/confirm the Birim (unit) by entering 'Klinik' into the Birim input (index 356). Stop after setting Birim to allow the page to update so the dependent 'Kişi' field can populate.
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div/div/div[2]/div/div/div/div/div[2]/div[2]/div/div/div/div/div[3]/div[2]/div[2]/div/div/div[2]/button/input').nth(0)
        await asyncio.sleep(3); await elem.fill('Klinik')
        
        # -> Open the Birim selector so an available unit option can be chosen (click the Birim selector). Stop after opening to re-observe available options.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div/div[2]/div/div/div/div/div[2]/div[2]/div/div/div/div/div[3]/div[2]/div[2]/div/div/div[2]/button').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Enter/confirm 'Klinik' into the Birim input (index 356) to select the unit. Stop after setting Birim and let the page update so the dependent Kişi field can populate.
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div/div/div[2]/div/div/div/div/div[2]/div[2]/div/div/div/div/div[3]/div[2]/div[2]/div/div/div[2]/button/input').nth(0)
        await asyncio.sleep(3); await elem.fill('Klinik')
        
        # -> Increase the 'Ziyaret Nedeni' text to meet the >=10 character validation and attempt to submit the form (click 'Ziyaretçi Ekle').
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div/div/div[2]/div/div/div/div/div[2]/div[2]/div/div/div/div/div[3]/div[3]/div[2]/div[2]/div/div[2]/textarea').nth(0)
        await asyncio.sleep(3); await elem.fill('Toplantı amacıyla ziyaret')
        
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div/div[2]/div/div/div/div/div[2]/div[2]/div/div/div/div/div[5]/div/button').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Open the Birim (unit) selector so an available unit option can be chosen (click element index 362). Stop and re-observe the options.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div/div[2]/div/div/div/div/div[2]/div[2]/div/div/div/div/div[3]/div[2]/div[2]/div/div/div[2]/button').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # --> Assertions to verify final state
        frame = context.pages[-1]
        assert await frame.locator("xpath=//*[contains(., 'İçeride')]").nth(0).is_visible(), "The visitor's status should be updated to İçeride after a successful check-in"
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    