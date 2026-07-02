import { test, expect } from '@playwright/test';

const TEST_EMAIL = 'giuseppi0501@gmail.com';
const TEST_PASSWORD = 'Gg123456';

test.describe('Flujos Críticos de Reserva y Autenticación', () => {

  // Test 1: Abrir modal de inicio de sesión al intentar reservar sin iniciar sesión
  test('Debería mostrar el modal de inicio de sesión al confirmar un horario sin haber iniciado sesión', async ({ page }) => {
    // 1. Abrir la página principal
    await page.goto('/');
    
    // Verificar que cargó la página de inicio
    await expect(page.locator('h1')).toContainText('Encuentra y reserva');

    // 2. Hacer clic en el enlace "Reserva tu cancha" de la barra de navegación
    const reservaNavBtn = page.locator('nav').locator('text=Reserva tu cancha');
    await expect(reservaNavBtn).toBeVisible();
    await reservaNavBtn.click();

    // Esperar que cargue la página de reservas
    await expect(page).toHaveURL(/\/reservas/);
    
    // Esperar a que las sedes y canchas se carguen de Supabase (esperamos que aparezca el botón de campus)
    const campusBtn = page.locator('aside button', { hasText: 'Sede Los Olivos' });
    await expect(campusBtn).toBeVisible({ timeout: 25000 }); // Tiempo extendido para compilación Next.js
    await campusBtn.click();

    // 4. Seleccionar la cancha Cancha F7 (B1)
    const courtCard = page.locator('button', { has: page.locator('h3', { hasText: 'Cancha F7 (B1)' }) }).first();
    await expect(courtCard).toBeVisible();
    await courtCard.click();

    // 5. Seleccionar el primer bloque horario libre disponible dentro de esa cancha
    const courtRow = courtCard.locator('xpath=..');
    const slotBtn = courtRow.locator('div.grid-cols-2 button:enabled').first();
    await expect(slotBtn).toBeVisible();
    await slotBtn.click();

    // 6. Hacer clic en "Continuar al pago" (que abre el modal de autenticación)
    const confirmBtn = page.locator('button', { hasText: 'Continuar al pago' });
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();

    // 7. Verificar que aparezca el modal de inicio de sesión (AuthModal)
    const modalHeading = page.locator('h2', { hasText: 'Inicia sesión para continuar' });
    await expect(modalHeading).toBeVisible();
  });

  // Test 2: Flujo de inicio de sesión directo
  test('Debería iniciar sesión correctamente con credenciales válidas', async ({ page }) => {
    // 1. Ir a la página de login
    await page.goto('/login');

    // 2. Llenar el formulario de inicio de sesión
    await page.fill('input[name="login_email"]', TEST_EMAIL);
    await page.fill('input[name="login_password"]', TEST_PASSWORD);

    // 3. Hacer clic en Iniciar sesión
    const submitBtn = page.locator('form button[type="submit"]', { hasText: 'Iniciar sesión' });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // 4. Verificar que se redirija o que la sesión esté iniciada
    await page.waitForTimeout(3000); // Esperar que refresque sesión
    
    // Verificamos que el enlace de 'Iniciar sesión' en el menú de navegación ya no esté visible
    const loginLink = page.locator('nav').locator('text=Iniciar sesión');
    await expect(loginLink).not.toBeVisible();
  });

  // Test 3: Flujo de reserva completo hasta checkout (con inicio de sesión)
  test('Debería completar el flujo de reserva hasta llegar a la pantalla de pago', async ({ page }) => {
    // 1. Ir directamente a reservas
    await page.goto('/reservas');
    
    // 2. Seleccionar campus y esperar a que cargue
    const campusBtn = page.locator('aside button', { hasText: 'Sede Los Olivos' });
    await expect(campusBtn).toBeVisible({ timeout: 25000 });
    await campusBtn.click();

    // 3. Seleccionar la cancha Cancha F7 (B1)
    const courtCard = page.locator('button', { has: page.locator('h3', { hasText: 'Cancha F7 (B1)' }) }).first();
    await expect(courtCard).toBeVisible();
    await courtCard.click();

    // 4. Seleccionar un bloque horario libre disponible
    const courtRow = courtCard.locator('xpath=..');
    const slotBtn = courtRow.locator('div.grid-cols-2 button:enabled').first();
    await expect(slotBtn).toBeVisible();
    await slotBtn.click();

    // 5. Hacer clic en "Continuar al pago" (abrirá el modal porque no hemos iniciado sesión aún)
    const confirmBtn = page.locator('button', { hasText: 'Continuar al pago' });
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();

    // 6. Iniciar sesión dentro del modal de autenticación
    const emailInput = page.locator('input[name="login_email"]');
    const passwordInput = page.locator('input[name="login_password"]');
    
    await expect(emailInput).toBeVisible();
    await emailInput.fill(TEST_EMAIL);
    await passwordInput.fill(TEST_PASSWORD);

    const loginSubmitBtn = page.locator('form button[type="submit"]', { hasText: 'Iniciar sesión' });
    await loginSubmitBtn.click();

    // Esperar a que el modal se cierre (ya no esté visible el encabezado del modal)
    await expect(page.locator('h2', { hasText: 'Inicia sesión para continuar' })).not.toBeVisible();

    // 7. Hacer clic de nuevo en "Continuar al pago" ya con la sesión iniciada para continuar a la reserva
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();

    // 8. Esperar redirección al checkout / pago
    await page.waitForURL(/\/reservas\/pago/, { timeout: 15000 });
    await expect(page).toHaveURL(/\/reservas\/pago/);
    
    // Verificar que cargó la pantalla de pago
    const paymentHeading = page.locator('h1', { hasText: 'Confirmación de pago' });
    await expect(paymentHeading).toBeVisible();
  });

});
