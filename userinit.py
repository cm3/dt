import argparse
import wget
import urllib.parse
import re
import os.path

re_id = re.compile("\/([^/]+?)\.pdf$")

path_head = ""
pdfpath_head = "./public/data/pdf/"

def fetch(_list_fn):
    list_id = []
    with open(_list_fn, "r", encoding="utf8") as fr:
        line = urllib.parse.unquote(fr.readline().strip())
        while line:
            sobj = re_id.search(line)
            if sobj:
                id_file = sobj.group(1)
                list_id.append(id_file)
                #print(line.strip())
                #print(pdfpath_head+id_file+".pdf")
                if not os.path.exists(pdfpath_head+id_file+".pdf"):
                    wget.download(line,pdfpath_head)
                else:
                    print(".pdf file already exists.")
                line = urllib.parse.unquote(fr.readline().strip())
    return list_id

def create_id_file(_list_id,_path_fn):
    with open(_path_fn,"w",encoding="utf8") as fw:
        fw.write("\n".join(_list_id))

def create_txt_file(_list_id,_path_head):
    for file_id in _list_id:
        path_txt = _path_head + "txt/" + file_id + ".txt"
        if not os.path.exists(path_txt):
            with open(path_txt,"w",encoding="utf8") as fw:
                fw.write("")
        else:
            print(".txt file already exists.")

def create_ann_file(_list_id,_path_head):
    for file_id in _list_id:
        path_txt = _path_head + "ann/" + file_id + ".ann"
        if not os.path.exists(path_txt):
            with open(path_txt,"w",encoding="utf8") as fw:
                fw.write("")
        else:
            print(".ann file already exists.")

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument("user")
    args = parser.parse_args()
    path_head = "./public/user/"+args.user+"/"
    #print(path_head)
    list_id = fetch(path_head+"url.list")
    create_id_file(list_id,path_head+"id.list")
    create_txt_file(list_id,path_head)
    create_ann_file(list_id,path_head)
    #wget.download(urllib.parse.unquote("http://xinchao.cias.kyoto-u.ac.jp/projects/mitou-lod/data/pdf/52/2/jjsas_52%282%29_137.pdf"),pdfpath_head)
