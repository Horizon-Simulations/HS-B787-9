from pathlib import Path

path = Path("horizonsim-789/src/model/build/")
file_name = "B787_lod1.gltf"
file_path = path / file_name

with open(file_path, encoding="utf8") as f:
    data_lines = f.read()

data_lines = data_lines.replace('"material": 60,', '"material": 3,')#DECALS1
data_lines = data_lines.replace('"material": 63,', '"material": 4,')#TAIL
data_lines = data_lines.replace('"material": 67,', '"material": 7,')#LIVERY1
data_lines = data_lines.replace('"material": 62,', '"material": 6,')#FUSELASGE1/DONE
data_lines = data_lines.replace('"material": 59,', '"material": 9,')#WINDSHIELD
data_lines = data_lines.replace('"material": 69,', '"material": 10,')#LIGHTS
data_lines = data_lines.replace('"material": 70,', '"material": 11,')#FROST
data_lines = data_lines.replace('"material": 66,', '"material": 13,')#DECALS2
data_lines = data_lines.replace('"material": 64,', '"material": 21,')#FUSELAGE2/DONE
data_lines = data_lines.replace('"material": 61,', '"material": 23,')#LIVERY1_3/DONE
data_lines = data_lines.replace('"material": 65,', '"material": 24,')#HANDLE/DONE
data_lines = data_lines.replace('"material": 72,', '"material": 22,')#GLASS
data_lines = data_lines.replace('"material": 71,', '"material": 29,')#HUBLOTx
# 68 M_WingBox?, 73 M_Belly, 74 Tail_Decals?
print("DONE!")

with open(file_path, mode="w", encoding="utf8") as f:
    f.write(data_lines)