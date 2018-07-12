source "https://rubygems.org"

git_source(:github) do |repo_name|
  repo_name = "#{repo_name}/#{repo_name}" unless repo_name.include?("/")
  "https://github.com/#{repo_name}.git"
end

gem "log2blog", github: "CodingItWrong/log2blog", branch: "master"
gem "dotenv"
gem "jekyll"
gem "minima"
