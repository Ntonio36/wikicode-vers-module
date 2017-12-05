function transform(){
	var finalWikitext = "";
	var objectif = document.getElementById("learnsetType").value;
	var type = document.getElementById("Type").value;
	var generation = document.getElementById("gen").value;
	var text = document.getElementById("input").value;
	if(generation == 6){
		var game = document.querySelector("input[name='6thGen']:checked").id; // XY ou ROSA ?
	}
	switch(objectif){
		case "Reproduction" :
			if(document.getElementById("noLearn").checked){
				finalWikitext = "{{#invoke:Apprentissage|reproduction|génération="+generation+"|type="+type+"|Aucune}}";
			}
			else {
				finalWikitext = "{{#invoke:Apprentissage|reproduction|génération="+generation+"|type="+type+"|\n";
				var isTemplate = document.getElementById("template").checked;
				var naturalParents = [];
				var chainParents = [];
				if(isTemplate){
					var templateTextBlocks = text.split(/\n\}\}\n/mg);
					console.log(templateTextBlocks);
					// Un modèle se finit forcément par }} ET laisse une nouvelle ligne derrière lui
					for(i = 0; i < templateTextBlocks.length; i++){
						var templateArguments = templateTextBlocks[i].split("\n|");
						var moveName = templateArguments[0].remove(/.{1,}\|/g).trim();
						if(templateArguments[1].indexOf("miniature") != -1){
							naturalParents = templateArguments[1].match(/\d{3}([a-z]|)/g);
						}
						if(templateArguments[2].indexOf("miniature") != -1){
							chainParents = templateArguments[2].match(/\d{3}([a-z]|)/g);
						}
						if(naturalParents){
							var naturalParentsNames = naturalParents.convertToNames();
						}
						if(chainParents){
							var chainParentsNames = chainParents.convertToNames();
						}
						// Si la regex a trouvé de quoi faire dans les deux textes de parents
						
						if(naturalParentsNames || chainParentsNames){
							finalWikitext += moveName;
							if(naturalParentsNames.length){ // Distinguer entre l'EXISTENCE de ces tableaux et CE QU'ILS CONTIENNENT
								finalWikitext += " / " + naturalParentsNames.join(", ");
							}
							if(chainParentsNames.length){
								finalWikitext += " / " + (naturalParentsNames.length ? " " : "/ ") + chainParentsNames.join(", ");
							}
						}
						finalWikitext += "\n";
					}
					finalWikitext += "}}";
				}
				else {
					var text_rows = text.split("\n|-\n");
					if(text_rows.length == 1){
						text_rows = text.split("\n| -\n");
					}
					for(b = 0; b < text_rows.length; b++){
						var rawMoveSections = text_rows[b].split("\n|");
						if(rawMoveSections.length == 1){
							rawMoveSections = text_rows[b].split("||");
						}
						var moveSections = rawMoveSections.toString().remove(/\n/g).split(",");
						// Merci à tous ceux qui ont intoxiqué les tableaux en leurs mettant des retours de ligne dans la même entrée de tableau
						var moveName = moveSections[0].trim();
						var naturalParents = moveSections[moveSections.length-2]; // Avant-derniers de leur liste (repro directe)

						var chainParents = moveSections[moveSections.length-1];	
						// Vous l'aurez deviné, ils sont les derniers (repro par chaîne)		
						moveName = moveName.remove("|").remove(/.{1,}\|/).remove("[[").remove("]]").trim();

						naturalParents = naturalParents.match(/\{\{.+?\}\}/g);
						chainParents = chainParents.match(/\{\{.+?\}\}/g);
						chainParents = checkORAS_content(game, chainParents);
						if(naturalParents){
							naturalParents = naturalParents.toString().match(/\d{3}([a-z]|)/g);
							naturalParents = checkORAS_content(game, naturalParents);
							var naturalParentsNames = naturalParents.convertToNames();
						}
						if(chainParents){
							chainParents = chainParents.toString().match(/\d{3}([a-z]|)/g);
							var chainParentsNames = chainParents.convertToNames();	
						}
						
						if(naturalParentsNames.length || chainParentsNames.length){
							finalWikitext += moveName;
							if(naturalParentsNames.length){
								finalWikitext += " / " + naturalParentsNames.join(", ");
							}
							if(chainParentsNames.length){
								finalWikitext += " " + (naturalParentsNames.length ? "" : "/") + "/ " + chainParentsNames.join(", ");
							}
							finalWikitext += "\n";
						}
					}
					finalWikitext += "}}";
				}
			}
		break;
		case "Donneur de Capacités" :
			finalWikitext = "{{#invoke:Apprentissage|donneur|génération="+generation+"|type="+type+"|";
			if(document.getElementById("noLearn").checked){
				finalWikitext += "Aucune}}";
			}
			else {
				finalWikitext += "\n";
				var text_rows = text.split("\n");
				for(i = 0; i < text_rows.length; i++){
					if(text_rows[i] == "|-") continue;
					else {
						var line = text_rows[i];
						var separateElements = line.split("||");
						var mapSpot = separateElements[2];
						var moveName = separateElements[0];
						var cost = separateElements[separateElements.length-1].toLowerCase();
						mapSpot = mapSpot.remove("| ");
						var quantity = 0;
						if(cost.indexOf("pco") != -1){
							cost = Number(cost.match(/[0-9]+/));
						}
						else if(cost.indexOf("tesson") != -1){
							var quantities = cost.match(/[0-9]{1,2}/g);
							var colorsWikiText = cost.split(/<small>.+?<\/small>/g);
							var colors = colorsWikiText.map(function(color){
								return color.replace(/.{1,} tesson/g,"").trim().replace(".png]]","");
							}).filter(function(filtered){
								return filtered != "";
							});
							var finalShardText = quantities[0] + " / tessons " + toPlural(colors[0],quantities[0]);
							for(i = 1; i < colors.length; i++){
								finalShardText += ", ou " + quantities[i] + (quantities[i] > 1 ?  " tessons " : " tesson ") + toPlural(colors[i],quantities[i]);
							}
						}
						moveName = moveName.remove("| ").remove("[[").remove(/.{1,}\|/).remove("]]");
						finalWikitext += moveName + (mapSpot[0] == " "?"/"+ mapSpot :"/ "+ mapSpot) +(Number(cost) || Number(quantity)?"/ "+(cost || quantity)+ " ":"")+(quantity?"/ "+finalShardText:"")+"\n";
					}
				}
				finalWikitext += "}}";
			}
		break;
		default : "";
	}
	document.getElementById("output").value = finalWikitext;
	// GG Tonio
}

function toggleOptions(condition){
		if(condition){
			document.getElementById("additionalOptions").style.display = "inline";
		}
		else {
			document.getElementById("additionalOptions").style.display = "none";
			document.getElementById("template").checked = false;
		}
}

String.prototype.remove = function(text){
	return this.replace(text,"");
};

Array.prototype.customFilter = function(toDodge){
	return this.filter(function(str){
		return str != toDodge;
	});
};

document.getElementById("noLearn").onclick = function(){
	var learnsNothing = this.checked;
	if(learnsNothing){
		document.getElementById("input").value = "";
		document.getElementById("input").disabled = "disabled";
	}
};

function releaseInput(){
	document.getElementById("input").disabled = "";
}

function checkSixthGen(dom){
	if(dom.value == 6){
		document.getElementById("xyORAS").style.display = "inline";
	}
	else {
		document.getElementById("xyORAS").style.display = "none";
		var inputs = document.getElementById("xyORAS").childNodes;
		for(i = 0; i < inputs.length; i++){
			inputs[i].checked = "";
		}
	}
}

function checkORAS_content(game, targetArray){
	var holder = [];
	var isSixthGeneration = document.getElementById("gen").value == 6;
	if(isSixthGeneration && game == "XY" && targetArray.indexOf("Sup|ROSA") != -1){
		holder = targetArray.filter(function(filtered){
			var currentIndex = targetArray.indexOf(filtered);
			if(targetArray[currentIndex+1] != "Sup|ROSA" || targetArray[currentIndex] != "Sup|ROSA"){
				return filtered;
			}
		});
	}
	else if(isSixthGeneration && game == "ROSA" && targetArray.indexOf("Sup|ROSA") != -1){
		holder = targetArray.filter(function(filtered){
			var currentIndex = targetArray.indexOf(filtered);
			if(targetArray[currentIndex] != "Sup|ROSA"){
				return filtered;
			}
		});
	}
	else {
		holder = targetArray;
	}
	return holder;
}

function toPlural(text,number){
	if(number > 1){
		return text + "s";
	}
	else return text;
}

Array.prototype.convertToNames = function(){
	return this.map(function(N_DexNum){
		if(N_DexNum.indexOf("a") != -1){
			return megaArray[(N_DexNum.remove("a"))-1] + " forme Alola";
		}
		else {
			return megaArray[N_DexNum-1];
		}
	});
}
