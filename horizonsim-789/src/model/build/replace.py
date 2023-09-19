file_name = "B787_lod1.gltf"

with open(file_name, encoding="utf8") as f:
    data_lines = f.read()

# 文字列置換
data_lines = data_lines.replace('"material": 59,', '"material": 9,')#WINDSHIELD
data_lines = data_lines.replace('"material": 60,', '"material": 3,')#DECALS1
data_lines = data_lines.replace('"material": 61,', '"material": 23,')#LIVERY1_3
data_lines = data_lines.replace('"material": 62,', '"material": 6,')#FUSELASGE1
data_lines = data_lines.replace('"material": 63,', '"material": 4,')#TAIL
data_lines = data_lines.replace('"material": 64,', '"material": 21,')#FUSELAGE2
data_lines = data_lines.replace('"material": 65,', '"material": 24,')#HANDLE
data_lines = data_lines.replace('"material": 66,', '"material": 13,')#DECALS2
data_lines = data_lines.replace('"material": 67,', '"material": 7,')#LIVERY1
#68 M_Belly
data_lines = data_lines.replace('"material": 69,', '"material": 6,')#FUSELASGE1
data_lines = data_lines.replace('"material": 70,', '"material": 10,')#LIGHTS
#71 RIGHT
data_lines = data_lines.replace('"material": 72,', '"material": 11,')#FROST
data_lines = data_lines.replace('"material": 73,', '"material": 29,')#HUBLOTx
#74 Tail_Decals
data_lines = data_lines.replace('"material": 75,', '"material": 22,')#GLASS




# 同じファイル名で保存
with open(file_name, mode="w", encoding="utf8") as f:
    f.write(data_lines)