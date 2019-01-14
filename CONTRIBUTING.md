# How to contribute to a Stellar project

Your contributions to the [Stellar network](https://www.stellar.org/) will help improve the world’s financial
infrastructure, faster.

We want to make it as easy as possible to contribute changes that
help the Stellar network grow and thrive. There are a few guidelines that we
ask contributors to follow so that we can merge your changes quickly.

## Getting Started

* Make sure you have a [GitHub account](https://github.com/signup/free).
* Create a GitHub issue for your contribution, assuming one does not already exist.
  * Clearly describe the issue including steps to reproduce if it is a bug.
* Fork the repository on GitHub.

### Minor Changes

#### Documentation

For small changes to comments and documentation, it is not
always necessary to create a new GitHub issue. In this case, it is
appropriate to start the first line of a commit with 'doc' instead of
an issue number.

## Finding things to work on

The first place to start is always looking over the current GitHub issues for the project you are interested in contributing to. Issues marked with [help wanted](https://github.com/issues?q=is%3Aopen+is%3Aissue+user%3Astellar+label%3A%22help+wanted%22) are usually pretty self-contained and a good place to get started.

Stellar.org also uses these same GitHub issues to keep track of what we are working on. If you see any issues that are assigned to a particular person or have the `in progress` label, that means someone is currently working on that issue. The `orbit` label means we will likely be working on this issue in the next week or two. The `ready` label means that the issue is one we have prioritized and will be working on in our next orbit (the Stellar term for a sprint) or two.

Of course, feel free to create a new issue if you think something needs to be added or fixed.

## Making Changes

* Create a topic branch from where you want to base your work.
  * This is usually the master branch.
  * Please avoid working directly on the `master` branch.
* Make sure you have added the necessary tests for your changes and make sure all tests pass.

## Submitting Changes

* [Sign the Contributor License Agreement](https://docs.google.com/forms/d/1g7EF6PERciwn7zfmfke5Sir2n10yddGGSXyZsq98tVY/viewform?usp=send_form).
* All content, comments, and pull requests must follow the [Stellar Community Guidelines](https://www.stellar.org/community-guidelines/).
* Push your changes to a topic branch in your fork of the repository.
* Submit a pull request to the [docs repository](https://github.com/stellar/docs) in the Stellar organization.
 * Include a descriptive [commit message](https://github.com/erlang/otp/wiki/Writing-good-commit-messages).
 * Changes contributed via pull request should focus on a single issue at a time.
 * Rebase your local changes against the master branch. Resolve any conflicts that arise.

At this point you're waiting on us. We like to at least comment on pull requests within three
business days (typically, one business day). We may suggest some changes, improvements or alternatives.

# Additional Resources

* [Contributor License Agreement](https://docs.google.com/forms/d/1g7EF6PERciwn7zfmfke5Sir2n10yddGGSXyZsq98tVY/viewform?usp=send_form)
* [Explore the API](https://www.stellar.org/developers/reference/)
* #dev channel on [Keybase](https://keybase.io/team/stellar.public)
* #dev channel on [Slack](http://slack.stellar.org)
* #stellar-dev IRC channel on freenode.org

This document is inspired by:

* https://github.com/puppetlabs/puppet/blob/master/CONTRIBUTING.md
* https://github.com/thoughtbot/factory_girl_rails/blob/master/CONTRIBUTING.md
* https://github.com/rust-lang/rust/blob/master/CONTRIBUTING.md
