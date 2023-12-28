repoUrl="git@git.daguchuangyi.com:prometheus/preset-app.git"
# "git@git.daguchuangyi.com:prometheus/preset-app.git"
templateName="my-template"
read -p "请输入新项目文件名称:" newTemplateName
read -p "请输入项目模版仓库地址:" newRepoUrl
read -p "请输入新项目仓库地址:" newOriginUrl

git clone ${newRepoUrl:-$repoUrl} ${newTemplateName:-$templateName}
rm -rf $templateName/.git
# mv $templateName $newTemplateName
cd $newTemplateName
git init
git add .
git commit -m "first commit"
git branch -M master
git remote add origin $newOriginUrl
git push -u origin master