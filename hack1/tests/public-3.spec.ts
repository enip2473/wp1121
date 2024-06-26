import { expect, test } from '@playwright/test'
import { examineLoremPost, examineLoremPostEditor, login, setup } from './utils'

test('3.1 Create a New Post With the Editor (5%)', async ({ page }) => {
  await setup()
  await login(page)
  const postButton = page.getByTestId('post-btn')
  const filenameInput = page.getByTestId('filename')
  const editor = page.getByTestId('editor').locator('.monaco-editor').nth(0)

  await page.getByTestId('tab-create').click()
  await filenameInput.fill('Lorem Post 3')
  await page.waitForTimeout(1500)

  await editor.click()
  await page.keyboard.type(`console.log("Hello, Lorem Post 3!")`)
  await page.waitForTimeout(500)
  await postButton.click()

  await page.getByTestId('tab-view').click()
  await page.getByTestId('tab-view').click()
  await page.waitForTimeout(5000)
  const nextButton = page.getByTestId('next-btn')
  await nextButton.click()
  await nextButton.click()
  await page.waitForTimeout(1000)
  await examineLoremPost(page, 2)
})

test('3.2 View User Posts With Files Tab (8%)', async ({ page }) => {
  const loremPost1 = page.getByTestId('filetab-000000000000000000000001')
  const loremPost2 = page.getByTestId('filetab-000000000000000000000002')
  await login(page)
  await page.getByTestId('tab-create').click()
  await loremPost1.click()
  await page.waitForTimeout(1000)
  await examineLoremPostEditor(page, 0)
  await loremPost2.click()
  await page.waitForTimeout(1000)
  await examineLoremPostEditor(page, 1)
})

test('3.3 Edit User Posts With Editor (8%)', async ({ page }) => {
  const loremPost1 = page.getByTestId('filetab-000000000000000000000001')
  const editor = page.getByTestId('editor').locator('.monaco-editor').nth(0)
  const postButton = page.getByTestId('post-btn')
  const content = page.getByTestId('post-content')

  await setup()
  await login(page)
  await page.getByTestId('tab-create').click()
  await loremPost1.click()
  await page.waitForTimeout(1500)

  await editor.click()
  await page.waitForTimeout(500)
  await page.keyboard.type(`modified`)
  await page.waitForTimeout(500)
  await postButton.click()
  await page.waitForTimeout(500)
  await page.getByTestId('tab-view').click()
  await expect(content).toHaveText(`1print(\"Hello, world!\")
2modified`)
})
