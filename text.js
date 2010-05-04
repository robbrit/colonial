var Text = {
  getText: function(label){
    return Text[Text.lang][label];
  },
  lang: "en"
};

Text.en = {
  inaccessible_housing: "Some housing plots are inaccessible."
};

function t(label){
  return Text.getText(label);
}
