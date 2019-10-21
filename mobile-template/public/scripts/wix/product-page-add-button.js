import wixWindow from "wix-window"
// For full API documentation, including code examples, visit https://wix.to/94BuAAs

let timeout = null
let prepared = false

$w.onReady(function() {
  $w("#getgotButton").onClick(shareWithGetGot)

  prepareGetGotButton({ productPageId: "productPage1", htmlId: "getgotButtonHTML" })
})

export function prepareGetGotButton({ productPageId, htmlId }) {
  timeout = null
  try {
    const productPage = $w(`#${productPageId}`)
    console.log("Product Page:", productPage)

    productPage.getProduct().then((productInfo) => {
      try {
        console.log("Product Info:", productInfo)

        const productDataToSend = {
          discount: productInfo.discount,
          images: productInfo.mediaItems.map(
            ({ id }) => `https://static.wixstatic.com/media/${id}`
          ),
          name: productInfo.name,
          productOptions: productInfo.productOptions,
          sku: productInfo.sku,
          url: productInfo.productPageUrl,
        }
        console.log(
          "GetGot Social",
          `#${htmlId}`,
          $w(`#${htmlId}`),
          $w(`#${htmlId}`).rendered,
          $w(`#${htmlId}`).isVisible
        )
        $w(`#${htmlId}`).postMessage({ action: "prepare", product: productDataToSend })
      } catch (ex) {
        console.error("GetGot Social", "Failed to retrieve product information.", ex)
      }
    })
  } catch (ex) {
    console.error("GetGot Social", "Failed to access Wix product page.", ex)
  }

  $w("#getgotButtonHTML").onMessage((event) => {
    console.log("GetGot Social", "Received Message from HTML", event.data)
    if (event.data === "prepared") {
      prepared = true
      if (timeout) {
        clearTimeout(timeout)
      }
    }
  })

  timeout = setTimeout(prepareGetGotButton, 1000, { productPageId, htmlId })
}

export function shareWithGetGot() {
  try {
    const productPage = $w("#productPage1")
    console.log("Product Page:", productPage)

    productPage.getProduct().then((productInfo) => {
      try {
        console.log("Product Info:", productInfo)

        const productDataToSend = {
          discount: productInfo.discount,
          images: productInfo.mediaItems.map(
            ({ id }) => `https://static.wixstatic.com/media/${id}`
          ),
          name: productInfo.name,
          productOptions: productInfo.productOptions,
          sku: productInfo.sku,
          url: productInfo.productPageUrl,
        }

        $w("#getgotButtonHTML").postMessage({ action: "share", product: productDataToSend })
      } catch (ex) {
        console.error("GetGot Social", "Failed to retrieve product information.", ex)
      }
    })
  } catch (ex) {
    console.error("GetGot Social", "Failed to access Wix product page.", ex)
  }
}
