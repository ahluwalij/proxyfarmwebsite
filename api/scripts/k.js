let m = `swysbf3s:rqp2pekf
318uwdsf:sxq58mxv
tfd6lcrm:mpfvmgh1
4skdkhzu:quj7czqz
b5mxf4bw:rgkvudrz
3taqpdvl:iggftig3
mez9mi9k:m3zobosz
evw23edm:qpwllye8
stixkpk4:3proy8lr
dayeagts:3fee6sy5
ri7h76kv:cz8zerkc
ah1satmw:v6uh3fjj
xzwq487l:ruknbsf8
gpx6kdek:vxpsieec
c1mbketj:barmuewv
wckkdqca:7jtq1bu9
3egmey7x:9rjztnkt
ot7vkjkg:jy7cutst
7clxtprh:oidh5e6h
p5uj1gte:jvmfkwet
rhvsswgs:byps193h
6czoeeeo:u1odwyw9
7jat8k12:tcfxxwzx
o1kphidx:amakjjlz
t38ds8n7:7i8oxonx
5jvyzky9:57ndrzfj
9t9tup5p:zjwlsksj
vnx22psf:6b5jw3uh
ccbft7ft:j5187vq1
5dimrjsw:ujx3yp34
c38peqrw:5fcgzh1m
7cz2als6:wiudz732
tcbki2pp:djgs2mys
bvhjxzwe:if7n8v7y
6m45ncd2:dqxfr154`.split("\n");

m.forEach((k) => {
  let p = k.split(":");
  console.log(`htpasswd -b /etc/squid/passwd ${p[0]} ${p[1]}`);
});
