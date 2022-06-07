import os
cdr= os.getcwd()

print(cdr)
os.system("git clone https://git.holy.how/holy/website transfers/")
print("mv -v "+str(cdr)+"/transfers/*"+" "+ str(cdr)+"/" )
os.system("mv -v "+str(cdr)+"/transfers/*"+" "+ str(cdr)+"/" )
os.system("yes | rm -r  "+ str(cdr)+"/transfers/")