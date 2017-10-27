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
			finalWikitext = "{{#invoke:Apprentissage|reproduction|génération="+generation+"|type="+type+"|";
			var isTemplate = document.getElementById("template").checked;
			if(isTemplate){
				var text_templateParts = text.split("\n");
				for(i = 0; i < text_templateParts.length; i+=4){
				if(text_templateParts[i] == "}}") continue;
					else {
						var moveName = text_templateParts[i].remove(/.{1,}\|/);
						var parents_natural = text_templateParts[i+1]?text_templateParts[i+1].remove("| ").remove(/\{\{miniature\|/g).split("}}").customFilter(""):false;
						var parents_chain = text_templateParts[i+2]?text_templateParts[i+2].remove("| ").remove(/\{\{miniature\|/g).split("}}").customFilter(""):undefined;
						if(parents_natural){
							var pokéNames_natural = parents_natural.map(function(num){
								return megaArray[num-1];
							});
						}
						else continue;
						if(parents_chain){
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
						var parents_natural = moveSections[4];
						var parents_chain = moveSections[5];
						moveName = moveName.remove("|").remove("[[").remove("]]").remove(/.{1,}\|/);
						parents_chain = parents_chain.remove(/\{\{miniature\|/g).split("}}");
						parents_chain.splice(parents_chain.length-1,1);
						parents_natural = parents_natural.remove(/\{\{miniature\|/g).split("}}");
						parents_natural.splice(parents_natural.length-1,1); //maudit ""
						var chainParentsArray = parents_chain.map(function(num){
							return megaArray[num-1];
						});
						var naturalParentsArray = parents_natural.map(function(num){
							return megaArray[num-1];
						});
						finalWikitext += "\n" + moveName+(parents_natural.toString()!=""?"/ "+naturalParentsArray.join(", ") +" /":"//")+(parents_chain.toString() != ""?" "+chainParentsArray.join(", "):"");
					}
				}
				finalWikitext += "\n}}";
			}
		}
		break;
		case "Donneur de Capacités" :
			finalWikitext = "{{#invoke:Apprentissage|donneur|génération="+generation+"|type="+type+"|";
			if(document.getElementById("noLearn").checked){
				finalWikitext += "Aucune}}";
			}
			else {
				var text_rows = text.split("\n");
				for(i = 0; i < text_rows.length; i++){
					if(text_rows[i] == "|-") continue;
					else {
						var line = text_rows[i];
						var separateElements = line.split("||");
						var mapSpot = separateElements[0];
						var moveName = separateElements[1];
						var cost = separateElements[7].remove(" PCo").remove(" [[PCo]]");
						mapSpot = mapSpot.remove("| ");
						moveName = moveName.remove("|").remove("[[").remove(/.{1,}\|/).remove("]]");
						finalWikitext += moveName + "/ "+mapSpot+" / "+Number(cost)+"\n";
					}
				}
			}
		break;
		default : "";
	}
	document.getElementById("output").value = finalWikitext;
	// GG Tonio
}

function toggleTemplate(condition){
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