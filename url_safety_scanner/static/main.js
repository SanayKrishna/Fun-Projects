document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('form');
  const spinner = document.getElementById('loadingSpinner');
  const urlInput = form.querySelector('input[name="url"]');
  const clearBtn = document.getElementById('clearBtn');

  form.addEventListener('submit', function (e) {
    const url = urlInput.value.trim();
    const valid = url.startsWith('http://') || url.startsWith('https://');

    if (!valid) {
      alert('Please enter a valid URL starting with http:// or https://');
      e.preventDefault();
      spinner.style.display = 'none';
      return;
    }

    // Show the spinner when submitting
    spinner.style.display = 'block';
  });

  clearBtn.addEventListener('click', function () {
  urlInput.value = '';
  spinner.style.display = 'none';
  // Animate alert out
  const alert = document.querySelector('.alert');
  if (alert) {
    alert.style.transition = "opacity 0.5s";
    alert.style.opacity = 0;
    setTimeout(() => { alert.style.display = 'none'; }, 500);
  }
});


  clearBtn.addEventListener('click', function () {
    urlInput.value = '';
    spinner.style.display = 'none';

    // Hide any visible alert messages (optional)
    const alert = document.querySelector('.alert');
    if (alert) {
      alert.style.display = 'none';
    }
  });

  // Hide spinner on page load (especially on page reload)
  window.addEventListener('pageshow', function () {
    spinner.style.display = 'none';
  });
});
