function transform(){
	var finalWikitext = "";
	var objectif = document.getElementById("learnsetType").value;
	var type = document.getElementById("Type").value;
	var generation = document.getElementById("gen").value;
	var text = document.getElementById("input").value;
	switch(objectif){
		case "Reproduction" :
		if(document.getElementById("noLearn").checked){
			finalWikitext = "{{#invoke:Apprentissage|reproduction|génération="+generation+"|type="+type+"|Aucune}}";
		}
		else {
			finalWikitext = "{{#invoke:Apprentissage|reproduction|génération="+generation+"|type="+type+"|\n";
			var isTemplate = document.getElementById("template").checked;
			if(isTemplate){
				var text_templateParts = text.split("\n");
				for(i = 0; i < text_templateParts.length; i+=4){
				if(text_templateParts[i] == "}}" || text_templateParts[i].indexOf("Haut") != -1 || text_templateParts[i].indexOf("génération") != -1) continue;
					else {
						var moveName = text_templateParts[i].remove(/\|.{1,}(\||)\s/);
						var parents_natural = text_templateParts[i+1]?text_templateParts[i+1].remove("| ").remove(/\{\{miniature\|/g).split("}}"):false;
						var parents_chain = text_templateParts[i+2]?text_templateParts[i+2].remove("| ").remove(/\{\{miniature\|/g).split("}}"):undefined;
						if(parents_natural){
							while(parents_natural.indexOf("") != -1){
								parents_natural.splice(parents_natural.indexOf(""),1);
							}
							var pokéNames_natural = parents_natural.map(function(num){
								return megaArray[num-1];
							});
						}
						else continue;
						if(parents_chain){
							while(parents_chain.indexOf("") != -1){
								parents_chain.splice(parents_chain.indexOf(""),1);
							}
							var pokéNames_chain = parents_chain.map(function(num){
								return megaArray[num-1];
							});
						}
						else continue;
						pokéNames_chain && pokéNames_natural?finalWikitext += moveName + " / " + pokéNames_natural.join(", ") + " / " + pokéNames_chain.join(", ")+"\n":"";
					}
				}
				finalWikitext += "}}";
			}
			else {
				var text_rows = text.split("\n|-\n");
				for(b = 0; b < text_rows.length; b++){
					if(text_rows[b] == "|-" || text_rows[b] == "" || text_rows[b] == "|}" || text_rows[b].indexOf("{|") != -1 || text_rows[b].indexOf("!") != -1) continue;
					else {
						var moveSections = text_rows[b].split("||");
						var moveName = moveSections[0];
						var parents_natural = moveSections[moveSections.length-2];
						var parents_chain = moveSections[moveSections.length-1];
						moveName = moveName.remove(/\|(\s|)/).remove(/.{1,}\|/).remove("[[").remove("]]");
						parents_chain = parents_chain.remove(/\{\{miniature\|/g).split("}}");
						parents_chain.splice(parents_chain.length-1,1);
						parents_natural = parents_natural.remove(/\{\{miniature\|/g).split("}}");
						parents_natural.splice(parents_natural.length-1,1); //maudit ""
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
						finalWikitext += moveName+(moveName[moveName.length-1] == " "?"":" ")+(parents_natural.toString()!=""?"/ "+naturalParentsArray.join(", ") +" /":"//")+(parents_chain.toString().replace(", , ",", ") != ""?" "+chainParentsArray.join(", "):"")+"\n";
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
						if(cost.indexOf("pco") != -1){
							cost = Number(cost.match(/[0-9]+/));
						}
						moveName = moveName.remove("| ").remove("[[").remove(/.{1,}\|/).remove("]]");
						finalWikitext += moveName + (mapSpot[0] == " "?"/"+mapSpot:"/ "+mapSpot)+(Number(cost)?" / "+cost:"")+"\n";
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
