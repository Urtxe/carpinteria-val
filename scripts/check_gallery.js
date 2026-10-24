// Ejecutar con playwright-cli run-code --filename=scripts/check_gallery.js
// tras abrir la web local o publicada en una sesión Chromium.
async (page) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const reset = page.locator("#zoom-reset");
  const image = page.locator("#modal-image");
  const viewport = page.locator(".image-viewport");
  const zoom = async () => parseInt(await reset.innerText(), 10);
  const check = (condition, message) => {
    if (!condition) throw Error(message);
  };
  const open = async () => {
    await page.locator(".project-image").first().click();
    await image.evaluate((el) => el.decode());
    await page.waitForFunction(
      () => document.querySelector("#zoom-reset").textContent === "100%",
    );
    const frame = await viewport.boundingBox();
    const photo = await image.boundingBox();
    check(photo.width <= frame.width + 1 && photo.height <= frame.height + 1,
      "La foto completa debe caber en el encuadre al 100%");
  };
  await page.setViewportSize({ width: 1440, height: 1000 });
  await open();
  check(
    await page.locator("#zoom-out").isDisabled(),
    "Alejar debe estar desactivado al 100%",
  );
  await image.hover();
  await page.mouse.wheel(0, -200);
  await page.waitForFunction(
    () => parseInt(document.querySelector("#zoom-reset").textContent) > 100,
  );
  for (let i = 0; i < 6; i++) {
    if (await page.locator("#zoom-in").isEnabled())
      await page.locator("#zoom-in").click();
  }
  check((await zoom()) === 500, "El máximo debe ser 500%");
  check(
    await page.locator("#zoom-in").isDisabled(),
    "Acercar debe desactivarse al máximo",
  );
  const bounds = await viewport.boundingBox();
  const before = await image.evaluate((el) => el.style.transform);
  await page.mouse.move(
    bounds.x + bounds.width / 2,
    bounds.y + bounds.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    bounds.x + bounds.width / 2 + 80,
    bounds.y + bounds.height / 2 + 60,
    { steps: 4 },
  );
  await page.mouse.up();
  check(
    before !== (await image.evaluate((el) => el.style.transform)),
    "El arrastre debe desplazar la foto",
  );
  await reset.click();
  await image.dblclick();
  check((await zoom()) === 250, "Doble clic debe acercar");
  await image.dblclick();
  check((await zoom()) === 100, "Segundo doble clic debe restablecer");
  await page.keyboard.press("Escape");
  check(
    await page
      .locator(".project-image")
      .first()
      .evaluate((el) => el === document.activeElement),
    "Debe recuperar el foco al cerrar",
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await open();
  const mobile = await viewport.boundingBox();
  const x = mobile.x + mobile.width / 2,
    y = mobile.y + mobile.height / 2;
  const cdp = await page.context().newCDPSession(page);
  const touch = (id, px, py) => ({ id, x: px, y: py });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [touch(1, x - 30, y), touch(2, x + 30, y)],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [touch(1, x - 85, y), touch(2, x + 85, y)],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await page.waitForFunction(
    () => parseInt(document.querySelector("#zoom-reset").textContent) > 200,
  );
  const touchBefore = await image.evaluate((el) => el.style.transform);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [touch(1, x, y)],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [touch(1, x + 45, y + 40)],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  check(
    touchBefore !== (await image.evaluate((el) => el.style.transform)),
    "El arrastre táctil debe desplazar la foto",
  );
  await cdp.detach();
  await page.screenshot({ path: "output/playwright/zoom-movil.png" });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    check(
      !(await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      )),
      "Desbordamiento en " + width,
    );
  }
  await page.getByRole("button", { name: "Cerrar fotografía" }).click();
  await open();
  check((await zoom()) === 100, "La reapertura debe restablecer el zoom");
  await page.getByRole("button", { name: "Acercar fotografía" }).click();
  await page.screenshot({ path: "output/playwright/zoom-escritorio.png" });
  await page.keyboard.press("Escape");
}
