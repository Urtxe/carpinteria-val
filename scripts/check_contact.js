// Ejecutar con playwright-cli run-code --filename=scripts/check_contact.js
// tras abrir la web LOCAL. Simula Web3Forms: nunca envía correos reales.
async (page) => {
  const assert = (condition, message) => {
    if (!condition) throw new Error(message);
  };
  assert(new URL(page.url()).hostname === "127.0.0.1", "Abrir primero la web local en 127.0.0.1");
  let mode = "error";
  let requests = 0;
  let body = "";
  let release;
  await page.route("https://web3forms.com/client/script.js", (route) => route.fulfill({
    contentType: "application/javascript", body: "",
  }));
  await page.route("https://api.web3forms.com/submit", async (route) => {
    requests++;
    body = route.request().postData();
    if (mode === "network") return route.abort();
    if (mode === "pending") await new Promise((resolve) => { release = resolve; });
    await route.fulfill({
      status: mode === "error" ? 400 : 200,
      contentType: "application/json",
      body: mode === "invalid" ? "not-json" : JSON.stringify({ success: mode !== "error" }),
    });
  });
  try {
    await page.reload();
    const form = page.locator("#contact-form");
    const submit = form.getByRole("button", { name: "Enviar consulta" });
    const status = form.getByRole("status");
    const message = form.locator('[name="message"]');
    await form.locator('[name="name"]').fill("Prueba local");
    await form.locator('[name="email"]').fill("prueba@example.com");
    await message.fill("Consulta de prueba que debe conservarse si falla.");
    await submit.click();
    assert(requests === 0, "No debe enviar sin captcha");
    assert((await status.innerText()).includes("verificación antispam"), "Debe explicar el captcha pendiente");
    await form.evaluate((element) => {
      const token = document.createElement("textarea");
      token.name = "h-captcha-response";
      token.value = "token-de-prueba";
      token.hidden = true;
      element.append(token);
      window.hcaptcha = { reset() { token.value = ""; } };
    });
    const token = () => form.evaluate((element) => {
      element.elements.namedItem("h-captcha-response").value = "token-de-prueba";
    });
    for (mode of ["error", "invalid", "network"]) {
      await token();
      await submit.click();
      await page.waitForFunction(() => !document.querySelector('#contact-form button').disabled);
      assert((await status.innerText()).includes("No hemos podido confirmar"), "Debe mostrar el fallo");
      assert((await message.inputValue()).includes("debe conservarse"), "Debe conservar el mensaje");
      assert(await form.locator('[name="h-captcha-response"]').inputValue() === "", "Debe renovar el captcha");
    }
    mode = "pending";
    await token();
    await submit.click();
    await page.waitForFunction(() => document.querySelector('#contact-form button').disabled);
    const count = requests;
    await form.evaluate((element) => element.dispatchEvent(new Event("submit", { cancelable: true })));
    assert(requests === count, "Debe bloquear envíos duplicados");
    assert(await form.getAttribute("aria-busy") === "true", "Debe anunciar el envío en curso");
    while (!release) await new Promise((resolve) => setTimeout(resolve, 10));
    release();
    await page.waitForFunction(() => !document.querySelector('#contact-form button').disabled);
    assert((await status.innerText()).includes("se ha enviado"), "Debe confirmar el éxito");
    assert(await message.inputValue() === "", "Debe limpiar el formulario tras el éxito");
    assert(body.includes("prueba@example.com") && body.includes("token-de-prueba"), "Debe enviar correo y captcha");
    assert(body.includes("3f1d53c6-5d46-40cc-addd-124b2f61d5b9"), "Debe usar la clave configurada");
    await page.setViewportSize({ width: 390, height: 844 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "No debe desbordar en móvil");
    return "OK: captcha, errores HTTP/red/JSON, conservación, bloqueo de duplicados, envío y móvil.";
  } finally {
    await page.unroute("https://web3forms.com/client/script.js");
    await page.unroute("https://api.web3forms.com/submit");
    await page.reload();
  }
}
