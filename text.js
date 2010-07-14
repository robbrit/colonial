var Text = {
  getText: function(label){
    return Text[Text.lang][label];
  },
  lang: "en"
};

Text.en = {
  corn_field: "Corn Field",
  destroy: "Destroy",
  housing_plot: "Housing Plot",
  inaccessible_housing: "Some housing plots are inaccessible.",
  must_be_near_road: "This building must be adjacent to a road.",
  plot_too_far: "Some housing plots are too far from a road.",
  population: "Population",
  road: "Road",
  unemployment: "Unemployment",
  water_hole: "Well",
  work_camp: "Work Camp"
};

Text.fr = {
  corn_field: "Champ de Ma&iumlat;s",
  destroy: "D&eacute;truire",
  housing_plot: "Logement",
  inaccessible_housing: "Il y a des logements qui sont inaccessible.",
  must_be_near_road: "Cet édifice doit être adjacent à une rue.",
  plot_too_far: "Il y a des logements qui ne sont pas adjacent à une rue.",
  population: "Population",
  road: "Rue",
  unemployment: "Ch&ocirc;mage",
  water_hole: "Fontaine",
  work_camp: "Camp de Travail"
};

Text.reload = function(){
  $(".building-btn img").each(function(){
    this.title = t(this.id.substring(4));
  });

  $("label.i18n").each(function(){
    this.innerHTML = t(this.id.substring(6));
  });
};

Text.setLang = function(lang){
  if (Text[lang] !== undefined){
    Text.lang = lang;
    Text.reload();
  }
}

function t(label){
  return Text.getText(label);
}
