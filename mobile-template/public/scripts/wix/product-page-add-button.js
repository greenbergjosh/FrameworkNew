import wixWindow from "wix-window"
// For full API documentation, including code examples, visit https://wix.to/94BuAAs

$w.onReady(function() {
  $w("#getgotButton").onClick(shareWithGetGot)
})

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
