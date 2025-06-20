router.post("/checkout", isLoggedInMiddleware, async (req, res) => {
  const user = await userModel.findById(req.userId).populate("cart.product");

  if (!user || user.cart.length === 0) {
    return res.redirect("/cart");
  }

  res.render("checkout", {
    cartProducts: user.cart.map(item => ({
      ...item.product.toObject(),
      quantity: item.quantity,
    })),
    user,
  });
});
