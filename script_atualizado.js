// Dados dos atendimentos
const dados = [
    ["Bela Vista", "Assistente Social", 0, 0, 0, 0, 0, 6, 13, 6],
    ["Jardim Bandeirantes", "Assistente Social", 0, 0, 0, 0, 0, 6, 20, 10],
    ["Jardim Eldorado", "Assistente Social", 0, 0, 0, 0, 0, 3, 20, 18],
    ["Multi I", "Assistente Social", 10, 17, 21, 19, 10, 0, 0, 0],
    ["Multi II", "Assistente Social", 6, 5, 5, 2, 1, 0, 0, 0],
    ["Multi III", "Assistente Social", 0, 0, 0, 0, 4, 12, 0, 0],
    ["Multi IV", "Assistente Social", 17, 30, 0, 21, 16, 17, 0, 0],
    ["Santa Cruz", "Assistente Social", 0, 0, 0, 0, 0, 1, 7, 8],
    ["Unidade Xv", "Assistente Social", 0, 0, 0, 0, 0, 1, 17, 18],
    ["Agua Branca", "Assistente Social", 0, 0, 0, 0, 0, 0, 0, 3],
    ["Novo Eldorado", "Assistente Social", 0, 0, 0, 0, 0, 0, 0, 9],
    ["Parque São João", "Assistente Social", 0, 0, 0, 0, 0, 0, 0, 22],
    ["Perobas", "Assistente Social", 0, 0, 0, 0, 0, 0, 0, 11],
    ["Agua Branca", "Auxiliar de enfermagem", 0, 0, 0, 1, 0, 0, 0, 0],
    ["Csu Eldorado", "Auxiliar de enfermagem", 0, 0, 0, 0, 1, 6, 0, 1],
    ["Jardim Bandeirantes", "Auxiliar de enfermagem", 703, 723, 601, 926, 1827, 535, 397, 368],
    ["Jardim Eldorado", "Auxiliar de enfermagem", 0, 36, 48, 50, 169, 32, 216, 36],
    ["Multi II", "Auxiliar de enfermagem", 0, 0, 0, 0, 0, 1, 0, 0],
    ["Novo Eldorado", "Auxiliar de enfermagem", 175, 28, 54, 202, 0, 0, 0, 0],
    ["Parque São João", "Auxiliar de enfermagem", 51, 194, 323, 139, 2, 233, 323, 372],
    ["Perobas", "Auxiliar de enfermagem", 138, 128, 303, 186, 313, 238, 275, 264],
    ["Unidade Xv", "Auxiliar de enfermagem", 355, 421, 358, 474, 585, 291, 442, 450],
    ["Bela Vista", "Auxiliar de enfermagem", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Santa Cruz", "Auxiliar de enfermagem", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Unidade Xv", "Auxiliar em Saude Bucal", 0, 0, 0, 0, 0, 0, 52, 52],
    ["Agua Branca", "Auxiliar em Saude Bucal", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Bela Vista", "Auxiliar em Saude Bucal", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Csu Eldorado", "Auxiliar em Saude Bucal", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Jardim Bandeirantes", "Auxiliar em Saude Bucal", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Jardim Eldorado", "Auxiliar em Saude Bucal", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Novo Eldorado", "Auxiliar em Saude Bucal", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Parque São João", "Auxiliar em Saude Bucal", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Perobas", "Auxiliar em Saude Bucal", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Santa Cruz", "Auxiliar em Saude Bucal", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Agua Branca", "Cirurgião Dentista", 153, 172, 173, 147, 174, 194, 274, 207],
    ["Csu Eldorado", "Cirurgião Dentista", 166, 158, 85, 101, 76, 137, 99, 52],
    ["Jardim Eldorado", "Cirurgião Dentista", 0, 146, 134, 140, 152, 135, 146, 168],
    ["Novo Eldorado", "Cirurgião Dentista", 141, 128, 21, 118, 71, 34, 112, 73],
    ["Parque São João", "Cirurgião Dentista", 179, 225, 183, 208, 257, 262, 190, 249],
    ["Unidade Xv", "Cirurgião Dentista", 246, 327, 250, 272, 364, 346, 367, 317],
    ["Bela Vista", "Cirurgião Dentista", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Jardim Bandeirantes", "Cirurgião Dentista", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Perobas", "Cirurgião Dentista", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Santa Cruz", "Cirurgião Dentista", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Agua Branca", "Enfermeiro", 545, 714, 281, 457, 828, 593, 498, 593],
    ["Bela Vista", "Enfermeiro", 97, 182, 45, 103, 199, 179, 89, 183],
    ["Csu Eldorado", "Enfermeiro", 740, 541, 680, 950, 1272, 1349, 1354, 1328],
    ["Jardim Bandeirantes", "Enfermeiro", 631, 473, 287, 222, 543, 568, 534, 376],
    ["Jardim Eldorado", "Enfermeiro", 231, 252, 256, 353, 341, 392, 252, 174],
    ["Multi II", "Enfermeiro", 0, 0, 0, 0, 0, 14, 0, 0],
    ["Novo Eldorado", "Enfermeiro", 95, 79, 98, 57, 302, 538, 325, 306],
    ["Parque São João", "Enfermeiro", 778, 584, 126, 474, 628, 761, 514, 533],
    ["Perobas", "Enfermeiro", 234, 315, 22, 374, 565, 531, 367, 368],
    ["Santa Cruz", "Enfermeiro", 198, 63, 103, 192, 168, 184, 125, 218],
    ["Unidade Xv", "Enfermeiro", 1611, 1257, 860, 749, 1196, 1314, 1327, 1085],
    ["Csu Eldorado", "Fisioterapeuta", 0, 1, 0, 1, 0, 0, 59, 53],
    ["Parque São João", "Fisioterapeuta", 0, 0, 0, 0, 0, 8, 21, 17],
    ["Multi I", "Fisioterapeuta/Emulti", 92, 2, 43, 36, 48, 0, 0, 0],
    ["Multi II", "Fisioterapeuta/Emulti", 48, 54, 49, 53, 36, 0, 0, 0],
    ["Multi IV", "Fisioterapeuta/Emulti", 14, 36, 29, 49, 38, 0, 0, 0],
    ["Novo Eldorado", "Fisioterapeuta", 0, 6, 16, 4, 1, 0, 28, 20],
    ["Agua Branca", "Fisioterapeuta", 0, 0, 0, 0, 0, 0, 0, 14],
    ["Bela Vista", "Fisioterapeuta", 0, 0, 0, 0, 0, 0, 0, 5],
    ["Jardim Bandeirantes", "Fisioterapeuta", 0, 0, 0, 0, 0, 0, 0, 17],
    ["Jardim Eldorado", "Fisioterapeuta", 0, 0, 0, 0, 0, 0, 0, 6],
    ["Perobas", "Fisioterapeuta", 0, 0, 0, 0, 0, 0, 0, 16],
    ["Santa Cruz", "Fisioterapeuta", 0, 0, 0, 0, 0, 0, 0, 5],
    ["Unidade Xv", "Fisioterapeuta", 0, 0, 0, 0, 0, 0, 0, 24],
    ["Agua Branca", "Fonoaudiologo", 0, 0, 0, 0, 0, 18, 10, 11],
    ["Bela Vista", "Fonoaudiologo", 0, 0, 0, 0, 0, 3, 0, 0],
    ["Csu Eldorado", "Fonoaudiologo", 0, 0, 0, 0, 0, 48, 25, 4],
    ["Jardim Eldorado", "Fonoaudiologo", 0, 0, 0, 0, 0, 5, 10, 15],
    ["Multi I", "Fonoaudiologo", 7, 50, 38, 51, 40, 0, 0, 0],
    ["Multi II", "Fonoaudiologo", 41, 49, 41, 34, 42, 28, 0, 0],
    ["Multi III", "Fonoaudiologo", 0, 0, 0, 2, 32, 22, 0, 0],
    ["Multi IV", "Fonoaudiologo", 0, 0, 0, 0, 0, 18, 0, 0],
    ["Novo Eldorado", "Fonoaudiologo", 0, 0, 0, 0, 0, 49, 24, 3],
    ["Perobas", "Fonoaudiologo", 0, 0, 0, 0, 0, 32, 20, 25],
    ["Parque São João", "Fonoaudiologo", 0, 0, 0, 0, 0, 19, 16, 18],
    ["Santa Cruz", "Fonoaudiologo", 0, 0, 0, 0, 0, 2, 0, 0],
    ["Unidade Xv", "Fonoaudiologo", 0, 0, 0, 0, 0, 11, 37, 22],
    ["Jardim Bandeirantes", "Fonoaudiologo", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Csu Eldorado", "Médico Clinico", 171, 55, 166, 179, 217, 174, 103, 215],
    ["Jardim Bandeirantes", "Médico Clinico", 111, 192, 170, 162, 201, 181, 66, 149],
    ["Novo Eldorado", "Médico Clinico", 163, 15, 107, 116, 138, 138, 135, 54],
    ["Parque São João", "Médico Clinico", 0, 1, 0, 2, 0, 0, 0, 0],
    ["Unidade Xv", "Médico Clinico", 43, 46, 122, 103, 109, 133, 156, 157],
    ["Agua Branca", "Médico Clinico", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Bela Vista", "Médico Clinico", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Jardim Eldorado", "Médico Clinico", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Perobas", "Médico Clinico", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Santa Cruz", "Médico Clinico", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Agua Branca", "Médico Estrategia da Familia", 832, 604, 825, 783, 1027, 895, 817, 940],
    ["Bela Vista", "Médico Estrategia da Familia", 165, 303, 243, 282, 321, 293, 314, 310],
    ["Csu Eldorado", "Médico Estrategia da Familia", 719, 875, 946, 1020, 1159, 968, 1141, 966],
    ["Jardim Bandeirantes", "Médico Estrategia da Familia", 681, 709, 604, 614, 910, 774, 803, 831],
    ["Jardim Eldorado", "Médico Estrategia da Familia", 612, 482, 509, 338, 748, 578, 616, 527],
    ["Novo Eldorado", "Médico Estrategia da Familia", 442, 472, 436, 501, 474, 501, 450, 461],
    ["Parque São João", "Médico Estrategia da Familia", 689, 796, 766, 507, 408, 560, 580, 704],
    ["Perobas", "Médico Estrategia da Familia", 198, 320, 366, 329, 494, 368, 271, 478],
    ["Santa Cruz", "Médico Estrategia da Familia", 416, 590, 501, 496, 564, 405, 445, 431],
    ["Unidade Xv", "Médico Estrategia da Familia", 1201, 958, 914, 1018, 1206, 1039, 1157, 895],
    ["Agua Branca", "Médico Ginecologista Obstetra", 0, 0, 1, 0, 1, 10, 43, 39],
    ["Bela Vista", "Médico Ginecologista Obstetra", 10, 27, 33, 7, 23, 31, 12, 30],
    ["Csu Eldorado", "Médico Ginecologista Obstetra", 20, 93, 71, 75, 50, 63, 28, 53],
    ["Jardim Bandeirantes", "Médico Ginecologista Obstetra", 32, 38, 38, 29, 29, 29, 64, 39],
    ["Jardim Eldorado", "Médico Ginecologista Obstetra", 0, 0, 0, 0, 0, 20, 42, 41],
    ["Multi I", "Médico Ginecologista Obstetra", 20, 26, 30, 17, 26, 0, 0, 0],
    ["Multi II", "Médico Ginecologista Obstetra", 7, 23, 18, 23, 0, 0, 0, 0],
    ["Multi III", "Médico Ginecologista Obstetra", 84, 78, 56, 43, 97, 50, 0, 0],
    ["Multi IV", "Médico Ginecologista Obstetra", 0, 0, 12, 0, 0, 0, 0, 0],
    ["Novo Eldorado", "Médico Ginecologista Obstetra", 0, 0, 0, 7, 21, 41, 10, 18],
    ["Parque São João", "Médico Ginecologista Obstetra", 29, 61, 53, 40, 52, 59, 22, 58],
    ["Perobas", "Médico Ginecologista Obstetra", 18, 30, 27, 33, 35, 34, 16, 34],
    ["Santa Cruz", "Médico Ginecologista Obstetra", 0, 0, 0, 0, 28, 17, 11, 25],
    ["Unidade Xv", "Médico Ginecologista Obstetra", 0, 0, 0, 0, 0, 10, 42, 60],
    ["Agua Branca", "Médico Pediatra", 0, 0, 0, 0, 0, 8, 40, 0],
    ["Csu Eldorado", "Médico Pediatra", 54, 55, 48, 16, 23, 48, 48, 51],
    ["Jardim Bandeirantes", "Médico Pediatra", 0, 0, 0, 0, 0, 30, 39, 9],
    ["Jardim Eldorado", "Médico Pediatra", 46, 40, 27, 30, 0, 19, 41, 0],
    ["Multi I", "Médico Pediatra", 6, 32, 34, 32, 1, 0, 0, 0],
    ["Multi II", "Médico Pediatra", 0, 0, 0, 33, 65, 8, 0, 0],
    ["Multi IV", "Médico Pediatra", 0, 2, 82, 83, 117, 13, 0, 0],
    ["Novo Eldorado", "Médico Pediatra", 26, 31, 34, 24, 2, 19, 22, 16],
    ["Parque São João", "Médico Pediatra", 33, 33, 45, 33, 0, 0, 25, 59],
    ["Perobas", "Médico Pediatra", 21, 24, 18, 28, 0, 0, 14, 24],
    ["Santa Cruz", "Médico Pediatra", 35, 33, 0, 0, 0, 21, 21, 27],
    ["Unidade Xv", "Médico Pediatra", 30, 37, 35, 24, 0, 0, 7, 25],
    ["Bela Vista", "Médico Pediatra", 0, 0, 0, 0, 0, 0, 0, 20],
    ["Agua Branca", "Médico Psiquiatra", 51, 55, 37, 45, 0, 44, 43, 38],
    ["Csu Eldorado", "Médico Psiquiatra", 0, 1, 1, 0, 1, 17, 27, 49],
    ["Jardim Bandeirantes", "Médico Psiquiatra", 0, 0, 0, 0, 0, 28, 62, 80],
    ["Jardim Eldorado", "Médico Psiquiatra", 0, 0, 1, 0, 2, 9, 21, 34],
    ["Parque São João", "Médico Psiquiatra", 0, 0, 0, 0, 0, 5, 13, 16],
    ["Multi I", "Médico Psiquiatra", 0, 2, 2, 11, 0, 0, 0, 0],
    ["Multi II", "Médico Psiquiatra", 111, 109, 60, 90, 97, 81, 0, 0],
    ["Multi IV", "Médico Psiquiatra", 58, 105, 90, 54, 45, 20, 0, 0],
    ["Unidade Xv", "Médico Psiquiatra", 2, 0, 0, 1, 0, 31, 72, 91],
    ["Bela Vista", "Médico Psiquiatra", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Novo Eldorado", "Médico Psiquiatra", 0, 0, 0, 0, 0, 0, 0, 17],
    ["Perobas", "Médico Psiquiatra", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Santa Cruz", "Médico Psiquiatra", 0, 0, 0, 0, 0, 0, 0, 23],
    ["Agua Branca", "Médico Residente", 223, 284, 149, 121, 150, 109, 38, 58],
    ["Bela Vista", "Médico Residente", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Csu Eldorado", "Médico Residente", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Jardim Bandeirantes", "Médico Residente", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Jardim Eldorado", "Médico Residente", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Novo Eldorado", "Médico Residente", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Parque São João", "Médico Residente", 0, 0, 0, 0, 0, 0, 93, 93],
    ["Perobas", "Médico Residente", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Santa Cruz", "Médico Residente", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Unidade Xv", "Médico Residente", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Agua Branca", "Nutricionista", 0, 0, 0, 0, 0, 9, 9, 17],
    ["Bela Vista", "Nutricionista", 0, 0, 0, 0, 0, 9, 5, 12],
    ["Csu Eldorado", "Nutricionista", 0, 0, 0, 0, 1, 6, 0, 3],
    ["Jardim Bandeirantes", "Nutricionista", 0, 0, 0, 0, 0, 16, 13, 30],
    ["Jardim Eldorado", "Nutricionista", 0, 0, 0, 0, 0, 1, 0, 0],
    ["Multi I", "Nutricionista", 0, 0, 4, 11, 64, 0, 0, 0],
    ["Multi II", "Nutricionista", 45, 34, 13, 20, 10, 1, 0, 0],
    ["Multi III", "Nutricionista", 0, 4, 17, 30, 29, 22, 0, 0],
    ["Multi IV", "Nutricionista", 3, 0, 0, 27, 69, 1, 0, 0],
    ["Novo Eldorado", "Nutricionista", 0, 1, 0, 0, 0, 14, 0, 4],
    ["Perobas", "Nutricionista", 0, 0, 0, 0, 0, 8, 8, 8],
    ["Santa Cruz", "Nutricionista", 0, 0, 0, 0, 0, 8, 18, 6],
    ["Unidade Xv", "Nutricionista", 0, 0, 0, 0, 0, 6, 0, 0],
    ["Parque São João", "Nutricionista", 0, 0, 0, 0, 0, 5, 14, 11],
    ["Novo Eldorado", "Professor de medicina", 4, 5, 11, 28, 12, 0, 0, 0],
    ["Parque São João", "Professor de medicina", 10, 18, 17, 23, 0, 15, 0, 2],
    ["Agua Branca", "Professor de medicina", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Bela Vista", "Professor de medicina", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Csu Eldorado", "Professor de medicina", 0, 0, 0, 0, 0, 0, 0, 7],
    ["Jardim Bandeirantes", "Professor de medicina", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Jardim Eldorado", "Professor de medicina", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Perobas", "Professor de medicina", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Santa Cruz", "Professor de medicina", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Unidade Xv", "Professor de medicina", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Multi I", "Professor de Educação Fisica na Saúde", 130, 122, 110, 3, 0, 0, 0, 72],
    ["Parque São João", "Professor de Educação Fisica na Saúde", 0, 0, 0, 0, 1, 0, 76, 46],
    ["Agua Branca", "Professor de Educação Fisica na Saúde", 0, 0, 0, 0, 0, 0, 0, 72],
    ["Bela Vista", "Professor de Educação Fisica na Saúde", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Csu Eldorado", "Professor de Educação Fisica na Saúde", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Jardim Bandeirantes", "Professor de Educação Fisica na Saúde", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Jardim Eldorado", "Professor de Educação Fisica na Saúde", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Novo Eldorado", "Professor de Educação Fisica na Saúde", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Perobas", "Professor de Educação Fisica na Saúde", 0, 0, 0, 0, 0, 0, 0, 43],
    ["Santa Cruz", "Professor de Educação Fisica na Saúde", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Unidade Xv", "Professor de Educação Fisica na Saúde", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Agua Branca", "Pscologo Clinico", 0, 0, 0, 0, 0, 5, 39, 0],
    ["Bela Vista", "Pscologo Clinico", 0, 0, 0, 0, 0, 6, 19, 18],
    ["Jardim Bandeirantes", "Pscologo Clinico", 0, 0, 0, 0, 0, 19, 37, 46],
    ["Multi I", "Pscologo Clinico", 100, 77, 51, 64, 102, 0, 0, 0],
    ["Multi II", "Pscologo Clinico", 44, 79, 54, 60, 70, 45, 0, 0],
    ["Multi III", "Pscologo Clinico", 77, 133, 125, 132, 164, 65, 0, 0],
    ["Multi IV", "Pscologo Clinico", 71, 60, 61, 14, 72, 41, 0, 0],
    ["Novo Eldorado", "Pscologo Clinico", 0, 0, 0, 0, 0, 81, 74, 53],
    ["Perobas", "Pscologo Clinico", 0, 0, 0, 0, 0, 6, 0, 0],
    ["Santa Cruz", "Pscologo Clinico", 0, 0, 0, 0, 0, 5, 26, 15],
    ["Parque São João", "Pscologo Clinico", 0, 0, 0, 0, 0, 21, 27, 16],
    ["Unidade Xv", "Pscologo Clinico", 0, 0, 0, 0, 0, 27, 54, 102],
    ["Csu Eldorado", "Pscologo Clinico", 0, 0, 0, 0, 0, 0, 0, 28],
    ["Jardim Eldorado", "Pscologo Clinico", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Agua Branca", "PsicÃ³logo clÃ-nico", 0, 0, 0, 0, 0, 0, 0, 39],
    ["Bela Vista", "PsicÃ³logo clÃ-nico", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Csu Eldorado", "PsicÃ³logo clÃ-nico", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Jardim Bandeirantes", "PsicÃ³logo clÃ-nico", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Jardim Eldorado", "PsicÃ³logo clÃ-nico", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Novo Eldorado", "PsicÃ³logo clÃ-nico", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Parque São João", "PsicÃ³logo clÃ-nico", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Perobas", "PsicÃ³logo clÃ-nico", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Santa Cruz", "PsicÃ³logo clÃ-nico", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Unidade Xv", "PsicÃ³logo clÃ-nico", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Agua Branca", "Tecnico de Enfermagem", 1613, 987, 1589, 1073, 1137, 1218, 1161, 1319],
    ["Bela Vista", "Tecnico de Enfermagem", 258, 258, 226, 319, 446, 356, 504, 259],
    ["Csu Eldorado", "Tecnico de Enfermagem", 1235, 1389, 1014, 663, 805, 610, 889, 1030],
    ["Jardim Bandeirantes", "Tecnico de Enfermagem", 1633, 1418, 1413, 2128, 2525, 2170, 2034, 1514],
    ["Jardim Eldorado", "Tecnico de Enfermagem", 750, 665, 621, 851, 840, 795, 656, 739],
    ["Novo Eldorado", "Tecnico de Enfermagem", 1814, 1749, 1676, 1446, 1941, 1937, 1775, 1969],
    ["Parque São João", "Tecnico de Enfermagem", 720, 698, 835, 720, 693, 484, 674, 569],
    ["Perobas", "Tecnico de Enfermagem", 142, 171, 231, 28, 5, 0, 12, 66],
    ["Santa Cruz", "Tecnico de Enfermagem", 857, 1055, 926, 933, 1199, 1108, 1236, 972],
    ["Unidade Xv", "Tecnico de Enfermagem", 1084, 1208, 1389, 1258, 1163, 1527, 1379, 1565],
    ["Agua Branca", "Terapeuta Ocupacional", 0, 0, 0, 0, 0, 7, 15, 11],
    ["Jardim Eldorado", "Terapeuta Ocupacional", 0, 0, 0, 0, 1, 6, 8, 11],
    ["Multi I", "Terapeuta Ocupacional", 0, 39, 42, 25, 41, 0, 0, 0],
    ["Multi III", "Terapeuta Ocupacional", 0, 0, 0, 0, 43, 13, 0, 0],
    ["Multi IV", "Terapeuta Ocupacional", 49, 51, 3, 6, 0, 0, 0, 0],
    ["Novo Eldorado", "Terapeuta Ocupacional", 0, 0, 0, 0, 0, 3, 0, 0],
    ["Perobas", "Terapeuta Ocupacional", 0, 0, 0, 0, 4, 14, 26, 20],
    ["Parque São João", "Terapeuta Ocupacional", 0, 0, 0, 0, 4, 24, 20, 22],
    ["Unidade Xv", "Terapeuta Ocupacional", 0, 0, 0, 0, 0, 3, 15, 9],
    ["Bela Vista", "Terapeuta Ocupacional", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Csu Eldorado", "Terapeuta Ocupacional", 0, 0, 0, 0, 0, 0, 0, 0],
    ["Santa Cruz", "Terapeuta Ocupacional", 0, 0, 0, 0, 0, 0, 0, 0]
];

const meses = ["jan./25", "fev./25", "mar./25", "abr./25", "mai./25", "jun./25", "jul./25", "ago./25"];
const mesesNomes = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto"];

// Função para ordenar unidades colocando Multi I, II, III, IV por último
function sortUnidades(unidades) {
    const multiUnits = unidades.filter(u => u.startsWith('Multi')).sort();
    const otherUnits = unidades.filter(u => !u.startsWith('Multi')).sort();
    return [...otherUnits, ...multiUnits];
}

const unidades = sortUnidades([...new Set(dados.map(item => item[0]))]);
const cbos = [...new Set(dados.map(item => item[1]))].sort();

let barChart, monthChart, doughnutChart, cboChart;
let selectedMeses = [];
let selectedUnidades = [];
let selectedCbos = [];

// Inicializar filtros
function initializeFilters() {
    // Filtro de Unidades
    const unidadeDropdown = document.getElementById('unidadeFilterDropdown');
    unidades.forEach(unidade => {
        const option = document.createElement('div');
        option.className = 'multiselect-option';
        option.innerHTML = `
            <input type="checkbox" id="unidade_${unidade.replace(/\s+/g, '_')}" value="${unidade}">
            <label for="unidade_${unidade.replace(/\s+/g, '_')}">${unidade}</label>
        `;
        unidadeDropdown.appendChild(option);
    });

    // Filtro de CBOs
    const cboDropdown = document.getElementById('cboFilterDropdown');
    cbos.forEach(cbo => {
        const option = document.createElement('div');
        option.className = 'multiselect-option';
        option.innerHTML = `
            <input type="checkbox" id="cbo_${cbo.replace(/\s+/g, '_')}" value="${cbo}">
            <label for="cbo_${cbo.replace(/\s+/g, '_')}">${cbo}</label>
        `;
        cboDropdown.appendChild(option);
    });

    // Event listeners para filtros
    document.addEventListener('change', function(e) {
        if (e.target.type === 'checkbox') {
            updateFilters();
        }
    });
}

// Função para alternar dropdown
function toggleDropdown(filterId) {
    const dropdown = document.getElementById(filterId + 'Dropdown');
    const display = document.querySelector(`#${filterId}Container .multiselect-display`);
    
    // Fechar outros dropdowns
    document.querySelectorAll('.multiselect-dropdown').forEach(d => {
        if (d !== dropdown) {
            d.classList.remove('show');
            d.parentElement.querySelector('.multiselect-display').classList.remove('active');
        }
    });
    
    dropdown.classList.toggle('show');
    display.classList.toggle('active');
}

// Fechar dropdowns ao clicar fora
document.addEventListener('click', function(e) {
    if (!e.target.closest('.custom-multiselect')) {
        document.querySelectorAll('.multiselect-dropdown').forEach(d => {
            d.classList.remove('show');
            d.parentElement.querySelector('.multiselect-display').classList.remove('active');
        });
    }
});

// Atualizar filtros
function updateFilters() {
    // Meses
    selectedMeses = Array.from(document.querySelectorAll('#mesFilterDropdown input:checked')).map(cb => cb.value);
    const mesDisplay = document.getElementById('mesFilterDisplay');
    mesDisplay.textContent = selectedMeses.length > 0 ? 
        selectedMeses.map(m => m.replace('./25', '')).join(', ') : 
        'Selecione os meses...';

    // Unidades
    selectedUnidades = Array.from(document.querySelectorAll('#unidadeFilterDropdown input:checked')).map(cb => cb.value);
    const unidadeDisplay = document.getElementById('unidadeFilterDisplay');
    unidadeDisplay.textContent = selectedUnidades.length > 0 ? 
        (selectedUnidades.length > 2 ? `${selectedUnidades.length} unidades selecionadas` : selectedUnidades.join(', ')) : 
        'Selecione as unidades...';

    // CBOs
    selectedCbos = Array.from(document.querySelectorAll('#cboFilterDropdown input:checked')).map(cb => cb.value);
    const cboDisplay = document.getElementById('cboFilterDisplay');
    cboDisplay.textContent = selectedCbos.length > 0 ? 
        (selectedCbos.length > 2 ? `${selectedCbos.length} CBOs selecionados` : selectedCbos.join(', ')) : 
        'Selecione os CBOs...';

    updateCharts();
    updateTable();
    updateTotalValue();
}

// Filtrar dados
function filterData() {
    return dados.filter(item => {
        const unidadeMatch = selectedUnidades.length === 0 || selectedUnidades.includes(item[0]);
        const cboMatch = selectedCbos.length === 0 || selectedCbos.includes(item[1]);
        return unidadeMatch && cboMatch;
    });
}

// Atualizar valor total
function updateTotalValue() {
    const filteredData = filterData();
    let total = 0;

    filteredData.forEach(item => {
        if (selectedMeses.length > 0) {
            selectedMeses.forEach(mes => {
                const mesIndex = meses.indexOf(mes) + 2;
                total += item[mesIndex] || 0;
            });
        } else {
            for (let i = 2; i < item.length; i++) {
                total += item[i] || 0;
            }
        }
    });

    document.getElementById('valorTotal').textContent = total.toLocaleString('pt-BR');
}

// Criar gráfico de barras por unidade
function createBarChart() {
    const ctx = document.getElementById('barChart').getContext('2d');
    
    if (barChart) {
        barChart.destroy();
    }

    const filteredData = filterData();
    let unidadeTotals = {};

    if (selectedMeses.length > 0) {
        selectedMeses.forEach(mes => {
            const mesIndex = meses.indexOf(mes) + 2;
            filteredData.forEach(item => {
                if (!unidadeTotals[item[0]]) {
                    unidadeTotals[item[0]] = 0;
                }
                unidadeTotals[item[0]] += item[mesIndex] || 0;
            });
        });
    } else {
        filteredData.forEach(item => {
            if (!unidadeTotals[item[0]]) {
                unidadeTotals[item[0]] = 0;
            }
            for (let i = 2; i < item.length; i++) {
                unidadeTotals[item[0]] += item[i] || 0;
            }
        });
    }

    const sortedUnidades = Object.keys(unidadeTotals).sort((a, b) => unidadeTotals[b] - unidadeTotals[a]);
    const values = sortedUnidades.map(unidade => unidadeTotals[unidade]);

    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedUnidades,
            datasets: [{
                label: 'Total de Atendimentos',
                data: values,
                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString('pt-BR');
                        }
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}

// Criar gráfico de barras por mês
function createMonthChart() {
    const ctx = document.getElementById('monthChart').getContext('2d');
    
    if (monthChart) {
        monthChart.destroy();
    }

    const filteredData = filterData();
    let monthTotals = {};

    meses.forEach((mes, index) => {
        monthTotals[mes] = 0;
        filteredData.forEach(item => {
            monthTotals[mes] += item[index + 2] || 0;
        });
    });

    const values = meses.map(mes => monthTotals[mes]);

    monthChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: mesesNomes,
            datasets: [{
                label: 'Total de Atendimentos por Mês',
                data: values,
                backgroundColor: 'rgba(251, 146, 60, 0.8)',
                borderColor: 'rgba(251, 146, 60, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString('pt-BR');
                        }
                    }
                }
            }
        }
    });
}

// Criar gráfico de barras horizontais por CBO
function createCboChart() {
    const ctx = document.getElementById('cboChart').getContext('2d');
    
    if (cboChart) {
        cboChart.destroy();
    }

    const filteredData = filterData();
    let cboTotals = {};

    if (selectedMeses.length > 0) {
        selectedMeses.forEach(mes => {
            const mesIndex = meses.indexOf(mes) + 2;
            filteredData.forEach(item => {
                if (!cboTotals[item[1]]) {
                    cboTotals[item[1]] = 0;
                }
                cboTotals[item[1]] += item[mesIndex] || 0;
            });
        });
    } else {
        filteredData.forEach(item => {
            if (!cboTotals[item[1]]) {
                cboTotals[item[1]] = 0;
            }
            for (let i = 2; i < item.length; i++) {
                cboTotals[item[1]] += item[i] || 0;
            }
        });
    }

    const sortedCbos = Object.keys(cboTotals).sort((a, b) => cboTotals[a] - cboTotals[b]);
    const values = sortedCbos.map(cbo => cboTotals[cbo]);

    cboChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedCbos,
            datasets: [{
                label: 'Total de Atendimentos por CBO',
                data: values,
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
                borderColor: 'rgba(34, 197, 94, 1)',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString('pt-BR');
                        }
                    }
                }
            }
        }
    });
}

// Criar gráfico de rosca
function createDoughnutChart() {
    const ctx = document.getElementById('doughnutChart').getContext('2d');
    
    if (doughnutChart) {
        doughnutChart.destroy();
    }

    const filteredData = filterData();
    let monthTotals = {};

    meses.forEach((mes, index) => {
        monthTotals[mes] = 0;
        filteredData.forEach(item => {
            monthTotals[mes] += item[index + 2] || 0;
        });
    });

    const values = meses.map(mes => monthTotals[mes]);
    const colors = [
        'rgba(239, 68, 68, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(14, 165, 233, 0.8)',
        'rgba(245, 158, 11, 0.8)'
    ];

    doughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: mesesNomes,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderColor: colors.map(color => color.replace('0.8', '1')),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

// Atualizar gráficos
function updateCharts() {
    createBarChart();
    createMonthChart();
    createCboChart();
    createDoughnutChart();
}

// Atualizar tabela
function updateTable() {
    const filteredData = filterData();
    const table = document.getElementById('dataTable');
    const thead = table.querySelector('thead tr');
    const tbody = table.querySelector('tbody');

    // Limpar tabela
    thead.innerHTML = '';
    tbody.innerHTML = '';

    if (filteredData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="100%" class="text-center py-4">Nenhum dado encontrado</td></tr>';
        return;
    }

    // Criar cabeçalho
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = '<th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">CBO</th>';
    
    unidades.forEach(unidade => {
        headerRow.innerHTML += `<th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">${unidade}</th>`;
    });
    
    thead.appendChild(headerRow);

    // Agrupar dados por CBO
    const cboData = {};
    filteredData.forEach(item => {
        const cbo = item[1];
        const unidade = item[0];
        
        if (!cboData[cbo]) {
            cboData[cbo] = {};
            unidades.forEach(u => {
                cboData[cbo][u] = 0;
            });
        }
        
        // Somar valores dos meses selecionados ou todos os meses
        if (selectedMeses.length > 0) {
            selectedMeses.forEach(mes => {
                const mesIndex = meses.indexOf(mes) + 2;
                cboData[cbo][unidade] += item[mesIndex] || 0;
            });
        } else {
            for (let i = 2; i < item.length; i++) {
                cboData[cbo][unidade] += item[i] || 0;
            }
        }
    });

    // Criar linhas da tabela
    Object.keys(cboData).sort().forEach(cbo => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        
        let rowHtml = `<td class="px-4 py-3 text-sm font-medium text-gray-900 border-b border-gray-200">${cbo}</td>`;
        
        unidades.forEach(unidade => {
            const value = cboData[cbo][unidade] || 0;
            rowHtml += `<td class="px-4 py-3 text-sm text-gray-900 text-center border-b border-gray-200">${value.toLocaleString('pt-BR')}</td>`;
        });
        
        row.innerHTML = rowHtml;
        tbody.appendChild(row);
    });
}

// Limpar filtros
function clearFilters() {
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
    
    selectedMeses = [];
    selectedUnidades = [];
    selectedCbos = [];
    
    document.getElementById('mesFilterDisplay').textContent = 'Selecione os meses...';
    document.getElementById('unidadeFilterDisplay').textContent = 'Selecione as unidades...';
    document.getElementById('cboFilterDisplay').textContent = 'Selecione os CBOs...';
    
    updateCharts();
    updateTable();
    updateTotalValue();
}

// Exportar para Excel
function exportToExcel() {
    const filteredData = filterData();
    
    if (filteredData.length === 0) {
        alert('Nenhum dado para exportar');
        return;
    }

    // Criar dados para exportação
    const exportData = [];
    
    // Cabeçalho
    const header = ['CBO', ...unidades];
    exportData.push(header);
    
    // Agrupar dados por CBO
    const cboData = {};
    filteredData.forEach(item => {
        const cbo = item[1];
        const unidade = item[0];
        
        if (!cboData[cbo]) {
            cboData[cbo] = {};
            unidades.forEach(u => {
                cboData[cbo][u] = 0;
            });
        }
        
        // Somar valores dos meses selecionados ou todos os meses
        if (selectedMeses.length > 0) {
            selectedMeses.forEach(mes => {
                const mesIndex = meses.indexOf(mes) + 2;
                cboData[cbo][unidade] += item[mesIndex] || 0;
            });
        } else {
            for (let i = 2; i < item.length; i++) {
                cboData[cbo][unidade] += item[i] || 0;
            }
        }
    });
    
    // Adicionar dados
    Object.keys(cboData).sort().forEach(cbo => {
        const row = [cbo];
        unidades.forEach(unidade => {
            row.push(cboData[cbo][unidade] || 0);
        });
        exportData.push(row);
    });
    
    // Converter para CSV
    const csvContent = exportData.map(row => row.join(',')).join('\n');
    
    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'atendimentos_distrito_eldorado.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    initializeFilters();
    updateCharts();
    updateTable();
    updateTotalValue();
    
    document.getElementById('clearFiltersBtn').addEventListener('click', clearFilters);
    document.getElementById('exportExcelBtn').addEventListener('click', exportToExcel);
});

