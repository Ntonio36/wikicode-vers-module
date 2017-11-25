function transform(){
	var finalWikitext = "";
	var objectif = document.getElementById("learnsetType").value;
	var type = document.getElementById("Type").value;
	var generation = document.getElementById("gen").value;
	var text = document.getElementById("input").value;
	if(generation == 6){
		var game = document.querySelector("input[name='6thGen']:checked").id;
	}
	switch(objectif){
		case "Reproduction" :
		if(document.getElementById("noLearn").checked){
			finalWikitext = "{{#invoke:Apprentissage|reproduction|génération="+generation+"|type="+type+"|Aucune}}";
		}
		else {
			finalWikitext = "{{#invoke:Apprentissage|reproduction|génération="+generation+"|type="+type+"|\n";
			var isTemplate = document.getElementById("template").checked;
			if(isTemplate){
				var parentsNatural = [];
				var parentsChain = [];
				var templateTextParts = text.split(/\n\}\}\n/g);
				for(i = 0; i < templateTextParts.length; i++){
					var splitted = templateTextParts[i].split("\n|");
					var moveName = splitted[0].remove(/.{1,}\|/g);
					if(splitted[1].indexOf("miniature") != -1){
						parentsNatural = splitted[1].split(/\{\{miniature\|/g);
					}
					else {
						parentsNatural = [];
					}
					if(splitted[2].indexOf("miniature") != -1){
						parentsChain = splitted[2].split(/\{\{miniature\|/g);
					}
					else {
						parentsChain = [];
					}
					
					var parentsNaturalNames = parentsNatural.map(function(dexNum){
						var name = dexNum.indexOf("a") != -1 ? megaArray[Number(dexNum.remove("a}}"))-1] : megaArray[dexNum.remove("}}")-1];
						return name;
					}).checkExistence();
					
					var parentsChainNames = parentsChain.map(function(dexNum){
						var name = dexNum.indexOf("a") !=-1 ? megaArray[Number(dexNum.remove("a}}"))-1] : megaArray[dexNum.remove("}}")-1];
						return name;
					}).checkExistence();
					
					finalWikitext += (parentsNaturalNames.length || parentsChainNames.length ? moveName + " /" + (parentsNaturalNames.length ?" " + parentsNaturalNames.join(", "):"") + (parentsChainNames.length ? (parentsNatural.length?" / ":"/ ") + parentsChainNames.join(", "):""):"") + "\n";
				}
				finalWikitext += "}}";
			}
			else {
				var text_rows = text.split("\n|-\n");
				if(text_rows.length == 1){
					text_rows = text.split("\n| -\n");
				}
				for(b = 0; b < text_rows.length; b++){
					var moveSections = text_rows[b].split("\n|");
					if(moveSections.length == 1){
						moveSections = text_rows[b].split("||");
					}
					var moveName = moveSections[0].trim();
					var parents_natural = moveSections[moveSections.length-2];
					console.log(moveSections);
					var parents_chain = moveSections[moveSections.length-1];
					moveName = moveName.remove(/\|/).remove(/.{1,}\|/).remove("[[").remove("]]");
					parents_chain = parents_chain.remove(/\{\{miniature\|/g).split("}}");
					parents_chain[parents_chain.length-1] == "" ? parents_chain.splice(parents_chain.length-1,1) : "";
					parents_natural = parents_natural.remove(/\{\{miniature\|/g).split("}}");
					parents_natural[parents_natural.length-1] == "" ? parents_natural.splice(parents_natural.length-1,1) : "";
					checkContentORAS(generation, game, parents_natural);
					checkContentORAS(generation, game, parents_chain);
					var i = 0;
					var chainParentsArray = parents_chain.map(function(num){
						var a = i;
						i++;
						return (parents_chain[a] == num && num.indexOf("a") != -1?megaArray[(num.remove("a"))-1] + " forme Alola":megaArray[num-1]);
					});
					i = 0;
					var naturalParentsArray = parents_natural.map(function(num){
						var a = i;
						i++;
						return (parents_natural[a] == num && num.indexOf("a") != -1?megaArray[(num.remove("a"))-1] + " forme Alola":megaArray[num-1]);
					});
					finalWikitext += (naturalParentsArray.length || chainParentsArray.length ? moveName.trim() + (naturalParentsArray.length || chainParentsArray.length ? " /" + (naturalParentsArray.length ? " " + naturalParentsArray.join(", ") : "") + (chainParentsArray.length ? (!naturalParentsArray.length ? "/ " : " / ") + chainParentsArray.join(", ") : "") : "") + "\n" : "");
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

String.prototype.turnToPlural = function(){
	var words = this.split(/\b/g);
	while(words.indexOf(" ") != -1){
		words.splice(words.indexOf(" "),1);
	}
	var pluralWords = words.map(function(word){
		return word + "s";
	});
	return pluralWords.join(" ");
};

Array.prototype.checkExistence = function(){
	var	toBan = [undefined,null,false];
	for(i = 0; i < 3; i++){
		if(toBan.indexOf(this[i]) != -1){
			this.splice(i,1);
		}
	}
	return this;
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

function checkContentORAS(var1, var2, arr){
	if(var1 == 6 && var2 == "XY" && arr.indexOf("{{Sup|ROSA") != -1){
		arr.splice(arr.indexOf("{{Sup|ROSA")-1,2);
	}
	else if(var2 == "ROSA" && arr.indexOf("{{Sup|ROSA") != -1){
		arr.splice(arr.indexOf("{{Sup|ROSA"),1);
	}
	var parentsLength = arr.length;
	arr[parentsLength-1] == "" ? arr.splice(arr.length-1,1) : ""; //maudit ""
}

function toPlural(text,number){
	if(number > 1){
		return text + "s";
	}
	else return text;
}
