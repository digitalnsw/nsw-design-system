var modal = null

function showModal(modalId) {
  modal = (modalId)
  $("#" + modal).show()
}

$("[data-modalopen]").click(function () {
  showModal($(this).data("modalopen"))
  return false;
})

$(window).click(function (event) {
  if (modal != null && $(event.target).is("#" + modal)) {
    $("#" + modal).hide()
    modal = null
  }
})

$("[data-modalclose]").click(function () {
  $("#" + modal).hide()
  modal = null
})
