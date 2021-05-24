#!/bin/bash

source="/cygdrive/r/ckb-tools/build/"
rsh="--rsh=ssh"

user=jmack
domain=ckb.tools
environment=
destination=$user@192.168.0.72:domains/$environment$domain/public_html/

params=""
params="$params -rltzv"
params="$params --delete"
params="$params --chmod=Dug=rwx,Do=rx,Dg+s,Fug=rw,Fo=r"
params="$params --perms"
params="$params --stats"
params="$params --exclude .DS_Store"
params="$params --exclude .svn"
params="$params --exclude .git"
params="$params --exclude /_assets"
params="$params --exclude /forum"

rsync "$rsh" $params "$source" "$destination"

read -p "Press [Enter] key to exit..."