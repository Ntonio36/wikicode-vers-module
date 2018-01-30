function transform(){
	var finalWikitext = "";
	var objectif = document.getElementById("learnsetType").value;
	var generation = document.getElementById("gen").value;
	var text = document.getElementById("input").value;
	var separator = "\n" + document.getElementById("rowSeparator").value + "\n";
	if (generation === 6) {
		var game = document.querySelector("input[name='6thGen']:checked").id; // XY ou ROSA ?
	}
	var header = text.match(/\{\|.+/);
	var tableType = header[0].match(/"tableaustandard (.+?)"/)[1].toString();
	switch (objectif) {
		case "Reproduction" :
			if (document.getElementById("noLearn").checked) {
				finalWikitext = "{{#invoke:Apprentissage|reproduction|génération="+generation+"| type="+ tableType+"|Aucune}}";
			} else {
				finalWikitext = "{{#invoke:Apprentissage|reproduction|génération="+generation+"| type="+ tableType+"|\n";
				var isTemplate = document.getElementById("template").checked;
				var naturalParents = [];
				var chainParents = [];
				if (isTemplate) {
					var templateTextBlocks = text.split(/\n\}\}\n/mg);
					// Un modèle se finit forcément par }} ET laisse une nouvelle ligne derrière lui. 
					// En tous cas, c'est le cas de {{Apprentissage Pokémon}}
					for (i = 0; i < templateTextBlocks.length; i++) {
						var templateArguments = templateTextBlocks[i].split("\n|");
						var moveName = templateArguments[0].remove(/.{1,}\|/g).trim();
						if (templateArguments[1].indexOf("miniature") != -1) {
							naturalParents = templateArguments[1].match(/\d{3}([a-z]|)/g);
						}
						if (templateArguments[2].indexOf("miniature") != -1) {
							chainParents = templateArguments[2].match(/\d{3}([a-z]|)/g);
						}
						if (naturalParents) {
							var naturalParentsNames = naturalParents.convertToNames();
						}

						if (chainParents) {
							var chainParentsNames = chainParents.convertToNames();
						}
						// Si la regex a trouvé de quoi faire dans les deux textes de parents
						
						if (naturalParentsNames || chainParentsNames) {
							finalWikitext += moveName;
							if (naturalParentsNames.length) { // Distinguer entre l'EXISTENCE de ces tableaux et CE QU'ILS CONTIENNENT
								finalWikitext += " / " + naturalParentsNames.join(", ");
							}
							if (chainParentsNames.length) {
								finalWikitext += " / " + (naturalParentsNames.length ? " " : "/ ") + chainParentsNames.join(", ");
							}
						}
						finalWikitext += "\n";
					}
					finalWikitext += "}}";
				} else {
					var text_rows = text.split(separator);
					for (b = 0; b < text_rows.length; b++) {
						var rawMoveSections = text_rows[b].split("\n|");
						if (rawMoveSections.length == 1) {
							rawMoveSections = text_rows[b].split("||");
						}
						var moveSections = rawMoveSections.toString().remove(/\n/g).split(",");
						// Merci à tous ceux qui ont intoxiqué les tableaux en leurs mettant des retours de ligne alors qu'on n'a pas changé de ligne à travailler, tel que le comprend l'interpréteur wikicode
						var moveName = moveSections[0].trim();
						var naturalParents = moveSections[moveSections.length-2]; // Avant-derniers de leur liste (repro directe)
						var chainParents = moveSections[moveSections.length-1];	
						// Vous l'aurez deviné, ils sont les derniers (repro par chaîne)		
						moveName = moveName.remove("|").remove(/.{1,}\|/).remove("[[").remove("]]").trim();
						naturalParents = naturalParents.match(/\{\{.+?\}\}/g);
						chainParents = chainParents.match(/\{\{.+?\}\}/g);
						chainParents = checkORAS_content(game, chainParents);
						if (naturalParents) {
							naturalParents = naturalParents.toString().match(/\d{3}([a-z]|)/g);
							naturalParents = checkORAS_content(game, naturalParents);
							var naturalParentsNames = naturalParents.convertToNames();
						}

						if (chainParents) {
							chainParents = chainParents.toString().match(/\d{3}([a-z]|)/g);
							var chainParentsNames = chainParents.convertToNames();	
						}
						
						if (naturalParentsNames.length || chainParentsNames.length) {
							finalWikitext += moveName;
							if (naturalParentsNames.length) {
								finalWikitext += " / " + naturalParentsNames.join(", ");
							}
							if (chainParentsNames.length) {
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
			finalWikitext = "{{#invoke:Apprentissage|donneur|génération="+generation+"| type="+ tableType+"|";
			if (document.getElementById("noLearn").checked) {
				finalWikitext += "Aucune}}";
			} else {
				finalWikitext += "\n";
				let headers = text.match(/\!.+\|\|.+(?:\n)/).toString().split("||");
				let movePlace, mapPlace, usedMoveTerm;
				let count = 0;
				for (term of headers) {
					let temp = term.remove(/[^A-z]/).trim();
					switch (temp) {
						case "Attaque":
						case "Capacité":
							movePlace = count;
							usedMoveTerm = temp;
							break;
						case "Emplacement":
							mapSpot_place = count;
							break;
						default: "";
					}
					count++;
				}

				let realMovesText = text.split(separator);
				if (realMovesText.length === 1) {
					alert("Peut-être que vous avez utilisé le mauvais séparateur ?");
					return;
				}
				realMovesText.splice(0, 1);
				realMovesText.pop();
				// Si le séparateur est valide, se débarrasser de l'en-tête et du pied
				for (i = 0; i < realMovesText.length; i++) {
					let line = realMovesText[i];
					let separateElements = line.split("||");
					let mapSpot = separateElements[mapSpot_place];
					let moveName = separateElements[movePlace];
					var cost = separateElements[separateElements.length-1].trim();
					mapSpot = mapSpot.remove("|").trim();
					var quantity = 0;
					if (cost.toLowerCase().indexOf("pco") != -1) {
						quantity = Number(cost.match(/[0-9]+/));
					} else if (cost.indexOf("tesson") != -1) {
						var quantities = cost.match(/[0-9]{1,2}/g);
						var colorsWikiText = cost.split(/<small>.+?<\/small>/g);
						var colors = colorsWikiText.map(function(color){
							return color.remove(/.+ tesson/g).remove(/\.[a-z]{3}\]\]/).trim();
						}).filter(function(filtered){
							return filtered != "";
						});
						var finalShardText = colors.map(function(shardColor){
							var currentIndex = colors.indexOf(shardColor);
							return quantities[currentIndex] + " " + toPlural(shardColor, quantities[currentIndex]);
							// 3 tessons rouges, 1 tesson bleu
						}).join(", ou ");
						cost = finalShardText.trim();
					}
					moveName = moveName.remove("| ").remove(/.+\|/).remove("]]").remove("[[").trim();
					if (cost) {
						finalWikitext += moveName + " / " + mapSpot + " / " + cost.replace("Pco", "[[PCo]]") + "\n";
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
	if (condition) {
		document.getElementById("additionalOptions").style.display = "inline";
	} else {
		document.getElementById("additionalOptions").style.display = "none";
		document.getElementById("template").checked = false;
	}
}

String.prototype.remove = function(text){
	return this.replace(text,"");
};

Array.prototype.customFilter = function(toDodge){
	return this.filter(function(str){
		return str !== toDodge;
	});
};

document.getElementById("noLearn").onclick = function(){
	var learnsNothing = this.checked;
	if (learnsNothing) {
		document.getElementById("input").value = "";
		document.getElementById("input").disabled = "disabled";
	}
};

function releaseInput(){
	document.getElementById("input").disabled = "";
}

function checkSixthGen(dom){
	if (dom.value === 6) {
		document.getElementById("xyORAS").style.display = "inline";
	} else {
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
	if (isSixthGeneration && game == "XY" && targetArray !== null && targetArray.indexOf("Sup|ROSA") != -1) {
		holder = targetArray.filter(function(filtered){
			var currentIndex = targetArray.indexOf(filtered);
			if (targetArray[currentIndex+1] != "Sup|ROSA" || targetArray[currentIndex] != "Sup|ROSA") {
				return filtered;
			}
		});
	} else if (isSixthGeneration && game == "ROSA" && targetArray !== null && targetArray.indexOf("Sup|ROSA") != -1) {
		holder = targetArray.filter(function(filtered){
			var currentIndex = targetArray.indexOf(filtered);
			if (targetArray[currentIndex] != "Sup|ROSA") {
				return filtered;
			}
		});
	} else {
		holder = targetArray;
	}
	return holder;
}

function toPlural(text,number){
	if (number > 1) {
		return text + "s";
	} else return text;
}

Array.prototype.convertToNames = function(){
	return this.map(function(N_DexNum){
		if (N_DexNum.indexOf("a") != -1) {
			return megaArray[(N_DexNum.remove("a"))-1] + " forme Alola";
		}
		else {
			return megaArray[N_DexNum-1];
		}
	});
}

document.getElementById("currentyear").innerHTML = new Date().getYear() + 1900;
