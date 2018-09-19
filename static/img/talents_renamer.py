import os

dir = r"/Users/MinhBook/MEGA/Vainglory/API/next/static/img/talents"

folderList = os.walk(dir)
all = ""
for index, folder in enumerate(folderList):
	if index == 0:
		all = folder
	for fileName in folder[2]:
		for rarity, abbrev in [("rare", "TalentA"), ("epic", "TalentB"), ("legendary", "TalentC")]:
			if rarity in fileName.lower():
				filePath = folder[0] + "/" + fileName
				extension = os.path.splitext(fileName)[1]
				os.rename(folder[0] + "/" + fileName, os.path.join(folder[0], all[1][index - 1] + "_" + abbrev + extension))