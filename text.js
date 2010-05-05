var Text = {
  getText: function(label){
    return Text[Text.lang][label];
  },
  lang: "en"
};

Text.en = {
  inaccessible_housing: "Some housing plots are inaccessible.",
  plot_too_far: "Some housing plots are too far from a road."
};

function t(label){
  return Text.getText(label);
}
