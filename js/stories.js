"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, unhideDelete = false) {
  // console.debug("generateStoryMarkup", story);
  const loggedIn = Boolean(currentUser);

  const hostName = story.getHostName();

  return $(`
      <li id="${story.storyId}">
        ${loggedIn ? genStarMarkup(currentUser, story) : ''}
        ${unhideDelete ? genDeleteMarkup() : ''}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-info story-author">by ${story.author}</small>
        <small class="story-info story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

async function createNewStory(evt) {
  console.debug('createNewStory');
  evt.preventDefault();

  const author = $('#story-author').val();
  const title = $('#story-title').val();
  const url = $('#story-url').val();

  const story = await storyList.addStory(currentUser, { author, title, url });

  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);

  $submitForm.trigger('reset');
  hidePageComponents();
  $allStoriesList.show();
}

$submitForm.on('submit', createNewStory);

function genStarMarkup(user, story) {
  const checkFavorite = user.checkFavorite(story);
  const star = checkFavorite ? 'fas' : 'far';

  return `
  <span class='star'>
    <i class='${star} fa-star'></i>
  </span>`;
}

async function toggleFavorite(e) {
  const $target = $(e.target);
  const $li = $target.closest('li');
  const $storyId = $li.attr('id');
  const story = storyList.stories.find(s => s.storyId === $storyId);

  if ($target.hasClass('far')) {
    await currentUser.addFavorite(story);
    $target.closest('i').toggleClass('fas far');
  } else {
    await currentUser.removeFavorite(story);
    $target.closest('i').toggleClass('fas far');
  }
  // console.log(currentUser.favorites); <- testing purposes
}

$allStoriesList.on('click', '.star', toggleFavorite);

function showFavoritedStories() {
  $favoritedStoriesList.empty();

  if (currentUser.favorites.length === 0) {
    $favoritedStoriesList.append('<h3>No favorited stories yet!</h3>');
  } else {
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favoritedStoriesList.append($story);
    }
  }

  $favoritedStoriesList.show();
}

async function deleteStory(e) {
  const $target = $(e.target);
  const $li = $target.closest('li');
  const storyId = $li.attr('id');

  await storyList.deleteStory(currentUser, storyId);
  hidePageComponents();
  await putStoriesOnPage();
}

function genDeleteMarkup() {
  return `
    <span class="delete">
      <i class="fas fa-trash"></i>
    </span>`;
}

$ownStoriesList.on('click', '.delete', deleteStory);

function showOwnStories() {
  $ownStoriesList.empty();

  if (currentUser.ownStories.length === 0) {
    $ownStoriesList.append('<h3>No stories submitted yet!</h3>')
  } else {
    for (let story of currentUser.ownStories) {
      const $story = generateStoryMarkup(story, true);
      $ownStoriesList.append($story);
    }
  }

  $ownStoriesList.show();
}